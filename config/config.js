var fs = require('fs'), ini = require('ini');

var fileName = __dirname + '/release.ini';
if (process.env.NODE_ENV == 'development') {
    fileName = __dirname + '/development.ini'
}

module.exports = ini.parse(fs.readFileSync(fileName, 'utf-8'));