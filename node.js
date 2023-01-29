const path = require("path");
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

module.exports = (name, config, options) => {

    const jsLoader = {
        test: /\.([jt]s)$/,
        loader: "babel-loader",
        exclude: /(node_modules)/,
        options: {
            presets: [
                [ "@babel/preset-env", {
                    targets: config.targets,
                    modules: false,
                    useBuiltIns: "usage",
                    corejs: {
                        version: "3.27",
                        proposal: true
                    }
                }],
                "@babel/typescript"
            ],
            plugins: [
                [ "@babel/proposal-decorators", { legacy: true } ],
                [ "@babel/proposal-class-properties",         {} ],
                [ "@babel/proposal-export-namespace-from",    {} ],
                [ "@babel/proposal-object-rest-spread",       {} ],
                [ "@babel/proposal-export-default-from",      {} ],
                [ "@babel/proposal-optional-chaining",        {} ]
            ]
        }
    };

    return {
        mode: options.mode,
        resolve: {
            extensions: [ ".js", ".ts" ],
            modules: [ "node_modules" ]
        },
        // https://codeburst.io/use-webpack-with-dirname-correctly-4cad3b265a92
        node: { __dirname: false },
        // Exclude built-in modules like path, fs, etc.
        target: 'node',
        // Exclude node_modules from webpack bundle
        externals: [ nodeExternals({ modulesFromFile: { exclude: [ "devDependencies" ] } }) ],
        entry: Object.fromEntries(Object.entries(config.entry).map( ([k,v]) => [k, [].concat(v).map(p=>path.resolve(p))] )),
        output: {
            path: path.resolve(config.outputPath||name),
            filename: "[name].js"
        },
        module: { rules: [ jsLoader ] },
        ...( options.mode=="development" ? { devtool: config.devtool || 'source-map' } : {})
    };
}
