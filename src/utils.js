const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');

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

function decrypt(str) {
  try {
    const rsa = new NodeRSA(fs.readSync('private.pem', 'utf-8'), { encryptionScheme: 'pkcs1' });
    return rsa.decrypt(str).toString();
  } catch (error) {
    console.error(error);
  }
}


module.exports = { config: getConfig, decrypt };
