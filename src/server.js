#!/usr/bin/env node
const server = require('http').createServer();
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip')
const utils = require('./utils');
const NodeRSA = require('node-rsa');

const config = utils.config();

const privateKeyPath = path.join(process.cwd(), 'private.pem');
const publicKeyPath = path.join(process.cwd(), 'public.pem');
if (!fs.existsSync(privateKeyPath)) {
  var key = new NodeRSA({ b: 1024 });
  fs.writeFileSync(privateKeyPath, key.exportKey('private'));
  fs.writeFileSync(publicKeyPath, key.exportKey('public'));
}

const deployBakPath = 'delopy_bak';

io.on('connection', function (client) {
  console.log('object');
  ss(client).on('deploy', function (stream, data) {
    const { size, token } = data;
    console.log('object');
    const c = utils.decrypt(token);
    console.log(c);
    if (config.token !== token) {
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

server.listen(config.port || 9000);
