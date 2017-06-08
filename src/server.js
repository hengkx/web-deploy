#!/usr/bin/env node
var io = require('socket.io')();
var ss = require('socket.io-stream');
var fs = require('fs');
var path = require('path');
var adm_zip = require('adm-zip');
// console.log(process.argv);

io.on('connection', function (client) {
    ss(client).on('deploy', function (stream, data) {
        var filename = path.basename(data.name);
        // console.log(path.parse(data.name).name);
        console.log(filename);
        console.log(data);

        stream.pipe(fs.createWriteStream(filename));

        const { size, key } = data;
        console.log(size);

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
            var unzip = new adm_zip(filename);
            unzip.extractAllTo(".", /*overwrite*/true);
        });
        // var unzip = new adm_zip(filename);
        // unzip.extractAllTo("adm/adm-unarchive/", /*overwrite*/true);
    });
});

io.listen(9000);