#!/usr/bin/env node
var io = require('socket.io-client');
var path = require('path');
var fs = require('fs');
var ss = require('socket.io-stream');
var archiver = require('archiver');

var socket = io.connect('http://localhost:9000');

socket.on('connect', function () {
    console.log('connect');
    const filename = __dirname + '/example.zip';
    // create a file to stream archive data to.
    var output = fs.createWriteStream(filename);
    var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        var stream = ss.createStream();
        const size = fs.statSync(filename).size;

        ss(socket).emit('deploy', stream, { name: filename, size, key: 'test' });

        fs.createReadStream(filename).pipe(stream);
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a directory
    archive.directory('C:/Users/happy/Desktop/NovelCrawler', '/');
    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
});

socket.on('reconnecting', function (count) {
    // console.log(count);
});
socket.on('connect_error', function (err) {
    // console.log(err.message);
});
socket.on('disconnect', function () {
    // console.log('disconnect');
});

socket.on('progress', (item) => {
    console.log(item);
});
socket.on('deploy', function () {
    console.log('deploy success');
    process.exit(0);
});
socket.on('deploy_failed', function (err) {
    console.log(err.message);
    process.exit(1);
});
