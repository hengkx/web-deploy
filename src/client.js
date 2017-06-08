#!/usr/bin/env node
var io = require('socket.io-client');
var path = require('path');
var fs = require('fs');
var ss = require('socket.io-stream');
var adm_zip = require('adm-zip');

var socket = io.connect('http://localhost:9000');

socket.on('connect', function () {
    console.log('connect');

    var stream = ss.createStream();
    var filename = 'C:/Users/happy/Desktop/NovelCrawler.zip';
    const size = fs.statSync(filename).size;
    console.log(size);

    var uploadedSize = 0;

    stream.on('end', function () {
        console.log('clent end');
        // var unzip = new adm_zip(filename);
        // unzip.extractAllTo(".", /*overwrite*/true);
    });

    ss(socket).emit('deploy', stream, { name: filename, size, key: 'test' });

    fs.createReadStream(filename).pipe(stream);

});
socket.on('disconnect', function () {
    console.log('disconnect');
});

socket.on('progress', (item) => {
    console.log(item);
});