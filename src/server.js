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
        console.log(filename);
        console.log(data.key);
        

        stream.pipe(fs.createWriteStream(filename));
        stream.on('end', function () {
            var unzip = new adm_zip(filename);
            unzip.extractAllTo(".", /*overwrite*/true);
        });
        // var unzip = new adm_zip(filename);
        // unzip.extractAllTo("adm/adm-unarchive/", /*overwrite*/true);
    });
});

io.listen(9000);