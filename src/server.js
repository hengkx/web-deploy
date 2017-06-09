#!/usr/bin/env node
var io = require('socket.io')();
var ss = require('socket.io-stream');
var fs = require('fs');
var path = require('path');
var extract = require('extract-zip')
var config = require('./utils')();

const deployBakPath = 'delopy_bak';

io.on('connection', function (client) {
    ss(client).on('deploy', function (stream, data) {
        const { size, key } = data;
        if (config.key !== key) {
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

io.listen(config.port);
