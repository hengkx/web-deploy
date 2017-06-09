var fs = require('fs');
var path = require('path');

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

module.exports = getConfig;
