#!/usr/bin/env node
const io = require('socket.io-client');
const path = require('path');
const fs = require('fs');
const ss = require('socket.io-stream');
const archiver = require('archiver');
const ProgressBar = require('progress');
const moment = require('moment');
const NodeRSA = require('node-rsa');
const chalk = require('chalk');
const invariant = require('invariant');
const program = require('commander');
const isString = require('lodash/isString');
const isNumber = require('lodash/isNumber');
const utils = require('./utils');

program
  .version(require('../package').version, '-v, --version')
  .option('--config [config]', 'Specify the configuration file, default .deploy')
  .parse(process.argv);


const config = utils.config(program.config || '.deploy');
invariant(
  isString(config.url),
  'Expected url to be a string'
);
invariant(isNumber(config.port),
  'Expected port to be a number'
);
const serverUrl = `${config.url}:${config.port}`;
console.log(serverUrl);
var socket = io.connect(serverUrl);
var bar = null;
let filename = '';

socket.on('connect', function () {
  console.log('connect');
  filename = path.join(process.cwd(), `deploy ${moment().format('YYYYMMDDHHmmss')}.zip`);

  // create a file to stream archive data to.
  var output = fs.createWriteStream(filename);
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  output.on('close', function () {
    bar = new ProgressBar('deploying [:bar] :rate/bps :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: archive.pointer()
    });
    var stream = ss.createStream();
    const size = archive.pointer();
    ss(socket).emit('deploy', stream, {
      name: filename,
      size,
      token: utils.encrypt(config.token)
    });

    fs.createReadStream(filename).pipe(stream);
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    console.log(chalk.red(err));
    process.exit(1);
    // throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);
  // append files from a directory
  archive.directory(path.join(process.cwd(), config.delpoyPath), '/');
  // finalize the archive (ie we are done appending files but streams have to finish yet)
  archive.finalize();
});

socket.on('reconnecting', function (count) {
  // console.log(count);
});
socket.on('connect_error', function (err) {
  console.log(err.message);
});
socket.on('disconnect', function () {
  // console.log('disconnect');
});

socket.on('progress', (item) => {
  // console.log(item);
  bar.tick(item);
});

socket.on('deploy', function () {
  fs.unlinkSync(filename);
  console.log(chalk.green('deploy success'));
  process.exit(0);
});

socket.on('deploy_failed', function (err) {
  fs.unlinkSync(filename);
  console.log(chalk.red(err));
  process.exit(1);
});
