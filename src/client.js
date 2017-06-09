#!/usr/bin/env node
var io = require('socket.io-client');
var path = require('path');
var fs = require('fs');
var ss = require('socket.io-stream');
var archiver = require('archiver');
var ProgressBar = require('progress');
var moment = require('moment');
var config = require('./utils')();

var socket = io.connect(`${config.url}:${config.port}`);
var bar = null;
let filename = '';

socket.on('connect', function () {
    console.log('connect');
    filename = path.join(process.cwd(), `deploy ${moment().format('YYYYMMDDhhmmss')}.zip`);
    console.log(filename);

    // create a file to stream archive data to.
    var output = fs.createWriteStream(filename);
    var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    output.on('close', function () {
        bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 30,
            total: archive.pointer()
        });
        var stream = ss.createStream();
        const size = archive.pointer();//fs.statSync(filename).size;

        ss(socket).emit('deploy', stream, { name: filename, size, key: config.key });

        fs.createReadStream(filename).pipe(stream);
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        console.log(err.message);
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
    console.log('deploy success');
    process.exit(0);
});

socket.on('deploy_failed', function (err) {
    fs.unlinkSync(filename);
    console.log(err);
    process.exit(1);
});
