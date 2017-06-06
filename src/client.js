#!/usr/bin/env node
var io = require('socket.io-client');
var path = require('path');
var fs = require('fs');
var ss = require('socket.io-stream');
var adm_zip = require('adm-zip');


fs.readdir(process.cwd(), function (err, files) {
    var zip = new adm_zip();
    files.forEach((item) => {
        const filePath = path.join(__dirname, item);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            zip.addLocalFolder(item);
        } else {
            console.log(filePath);
            var input = fs.readFileSync(filePath);
            zip.addFile(item, input, './s', 0644);
            // zip.addLocalFile(filePath);
        }
    });
    // zip.addLocalFolder('H:/BaiduNetdiskDownload');
    console.log('object');
    var willSendthis = zip.toBuffer();
    zip.writeZip('adm-archive.zip');
});


var socket = io.connect('http://localhost:9000');
var stream = ss.createStream();

var filename = 'C:/Users/happy/Desktop/NovelCrawler.zip';

ss(socket).emit('deploy', stream, { name: filename, key: 'test' });

fs.createReadStream(filename).pipe(stream);
stream.on('end', function () {
    var unzip = new adm_zip(filename);
    unzip.extractAllTo(".", /*overwrite*/true);
});