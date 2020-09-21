const stringifyPackage = require('stringify-package')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline')

module.exports.readVersion = function (contents) {
    const regex = /(?<=artifacts\/v)(.*)(?=\/raw)/g;
    let version = JSON.parse(contents).download.match(regex);
    return version[0];
}

module.exports.writeVersion = function (contents, version) {
    const regex = /(?<=artifacts\/v)(.*)(?=\/raw)/g;
    const json = JSON.parse(contents)
    let indent = detectIndent(contents).indent
    let newline = detectNewline(contents)
    json.download = json.download.replace(regex, version)
    return stringifyPackage(json, indent, newline)
}