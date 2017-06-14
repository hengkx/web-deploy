const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function getConfig() {
  const configPath = path.join(process.cwd(), '.deploy');
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return {};
  } catch (error) {
    return {};
  }
}

function encrypt(str) {
  try {
    const rsa = new NodeRSA(fs.readFileSync('public.pem', 'utf8'), { encryptionScheme: 'pkcs1' });
    return rsa.encrypt(str, 'base64');
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}


function decrypt(str) {
  try {
    const rsa = new NodeRSA(fs.readFileSync('private.pem', 'utf8'), { encryptionScheme: 'pkcs1' });
    return rsa.decrypt(str, 'utf8');
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}


module.exports = { config: getConfig, decrypt, encrypt };
