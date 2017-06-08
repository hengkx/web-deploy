#!/usr/bin/env node
var io = require('socket.io')();
var ss = require('socket.io-stream');
var fs = require('fs');
var path = require('path');
var extract = require('extract-zip')

io.on('connection', function (client) {
    ss(client).on('deploy', function (stream, data) {
        var filename = path.basename(data.name);
        // console.log(path.parse(data.name).name);
        console.log(data);
        const filepath = path.join('bak', filename);
        if (!fs.existsSync('bak')) fs.mkdirSync('bak');
        stream.pipe(fs.createWriteStream(filepath));

        const { size, key } = data;

        var uploadedSize = 0;

        stream.on('data', function (buffer) {
            var segmentLength = buffer.length;

            // Increment the uploaded data counter
            uploadedSize += segmentLength;
            client.emit('progress', (uploadedSize / size * 100).toFixed(2));
            // Display the upload percentage
            // console.log("Progress:\t", ((uploadedSize / size * 100).toFixed(2) + "%"));
        });

        stream.on('end', function () {
            extract(filepath, { dir: process.cwd() }, function (err) {
                if (err) {
                    client.emit('deploy_failed', err);
                    console.log(err);
                } else {
                    client.emit('deploy');
                }
            })
        });
    });
});

io.listen(9000);