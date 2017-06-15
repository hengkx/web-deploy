#!/usr/bin/env node
const server = require('http').createServer();
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip')
const NodeRSA = require('node-rsa');
const randomstring = require('randomstring');
const chalk = require('chalk');
const utils = require('./utils');

const configPath = path.join(process.cwd(), '.deploy');
if (!fs.existsSync(configPath)) {
  const config = {
    delpoyPath: "app",
    token: randomstring.generate(),
    url: "http://localhost",
    port: 9000
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const privateKeyPath = path.join(process.cwd(), 'private.pem');
const publicKeyPath = path.join(process.cwd(), 'public.pem');
if (!fs.existsSync(privateKeyPath)) {
  var key = new NodeRSA({ b: 1024 });
  fs.writeFileSync(privateKeyPath, key.exportKey('private'));
  fs.writeFileSync(publicKeyPath, key.exportKey('public'));
}

const config = utils.config();

const deployBakPath = 'delopy_bak';

io.on('connection', function (client) {
  ss(client).on('deploy', function (stream, data) {
    const { size, token } = data;
    const decryptToken = utils.decrypt(token);
    if (!decryptToken || config.token !== decryptToken) {
      return client.emit('deploy_failed', 'key invalid');
    }

    var filename = path.basename(data.name);
    // console.log(path.parse(data.name).name);
    const filepath = path.join(deployBakPath, filename);
    if (!fs.existsSync(deployBakPath)) fs.mkdirSync(deployBakPath);
    stream.pipe(fs.createWriteStream(filepath));

    var uploadedSize = 0;

    stream.on('data', function (chunk) {
      var segmentLength = chunk.length;

      // Increment the uploaded data counter
      uploadedSize += segmentLength;
      client.emit('progress', chunk.length);
      // Display the upload percentage
      // console.log("Progress:\t", ((uploadedSize / size * 100).toFixed(2) + "%"));
    });

    stream.on('end', function () {
      extract(filepath, { dir: process.cwd() }, function (err) {
        if (err) {
          client.emit('deploy_failed', err.message);
          console.log(err);
        } else {
          client.emit('deploy');
        }
      })
    });
  });
});
const port = config.port || 9000;
console.log(chalk.blue(`listen ${port}`));
server.listen(port);
