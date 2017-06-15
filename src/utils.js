const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function getConfig(filename = '.deploy') {
  try {
    const configPath = path.join(process.cwd(), filename);
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return {};
  } catch (error) {
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

const privateKeyPath = path.join(process.cwd(), 'private.pem');
const publicKeyPath = path.join(process.cwd(), 'public.pem');

function encrypt(str) {
  try {
    const rsa = new NodeRSA(fs.readFileSync(publicKeyPath, 'utf8'), { encryptionScheme: 'pkcs1' });
    return rsa.encrypt(str, 'base64');
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}


function decrypt(str) {
  try {
    const rsa = new NodeRSA(fs.readFileSync(privateKeyPath, 'utf8'), { encryptionScheme: 'pkcs1' });
    return rsa.decrypt(str, 'utf8');
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}


module.exports = { config: getConfig, decrypt, encrypt };
