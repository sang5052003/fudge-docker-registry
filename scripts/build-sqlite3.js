const fs = require('fs');
const mkdirp = require('mkdirp');
const binary = require('node-pre-gyp');
const path = require('path');
const bindingPath = binary.find(path.resolve(path.join(__dirname, '../node_modules/sqlite3/package.json')));

const distDir = process.env.BUNDLE_JS_DIR ? path.resolve(process.env.BUNDLE_JS_DIR) : path.resolve(__dirname, '../dist');
const distFile = path.resolve(distDir, path.basename(bindingPath));

mkdirp.sync(distDir);

console.log("SQLITE3 BINDING : ", bindingPath);
console.log("SQLITE3 DIST    : ", distFile);

fs.copyFileSync(bindingPath, path.resolve(distDir, path.basename(bindingPath)));
