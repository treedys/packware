#!/usr/bin/env node

const fs = require('fs');
const path = require("path");
const webpack = require('webpack');
const merge = require('webpack-merge');

if(!Object.fromEntries)
    Object.fromEntries = arr => Object.assign({}, ...Array.from(arr, ([k, v]) => ({[k]: v}) ));

const package = JSON.parse(fs.readFileSync('./package.json'));

const TARGET = process.env.npm_lifecycle_event;

const options = {
    mode: !TARGET || TARGET==="start" || TARGET==="debug" ? 'development' : 'production'
};

const configs = Object.entries(package.packware).map( ([name, config]) => {
    switch(config.target) {
        case 'node':
            return require('./node.js')(name, config, options);
        case 'react':
            return require('./react.js')(name, config, options);
    }
});

const compiler = webpack(configs);

compiler.run( (err, stats) => {
    if(err) {
        console.error("WEBPACK:", err);
        process.exit(1);
    }

    console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console}));
    }));
});
