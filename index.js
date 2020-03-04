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
    mode: !TARGET || TARGET==="start" || TARGET==="debug" ? 'development' : 'production',
    ... package.packware.options
};

const configs = Object.entries(package.packware).map( ([name, packageConfig]) => {
    let config;
    switch(packageConfig.target) {
        case 'node':
            config = require('./node.js')(name, packageConfig, { ...options, ...packageConfig.options });
            break;
        case 'react':
            config = require('./react.js')(name, packageConfig, { ...options, ...packageConfig.options });
            break;
        case undefined:
            console.error("WEBPACK: Undefined target");
            process.exit(1);
            break;
        default:
            console.error(`WEBPACK: Unknown target ${packageConfig.target}`);
            process.exit(1);
            break;
    }

    if( packageConfig.plugin )
        config = [].concat(packageConfig.plugin).reduce( (config, plugin) => require(path.resolve(plugin))(config, options), config);

    return config;
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
