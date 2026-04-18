const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const content = fs.readFileSync('c:/Users/User710/Documents/FeDe/App/compiled.html', 'utf8');

const dom = new JSDOM(content, {
  runScripts: "dangerously",
});

console.log('JSDOM initialized. Waiting for errors...');
