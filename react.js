const path = require("path");
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (name, config, options) => {

    const templateName      = options.mode=="development" ? "[name]" : "[name].[hash:8]";
    const templateChunkName = options.mode=="development" ? "[name]" : "[name].[contenthash:8]";
    const indexHtmlTemplate = path.resolve(__dirname, "index.html");

    const jsxLoader = {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /(node_modules)/,
        options: {
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            browsers: "defaults",
                            ...config.targets
                        },
                        modules: false
                    }
                ],
                "@babel/preset-react"
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

    const htmlLoader = {
        test: /\.html$/,
        use: [
            { loader: "html-loader" },
            { loader: "html-minify-loader" }
        ],
        exclude: indexHtmlTemplate
    };

    const cssLoader = {
        test: /\.css$/,
        use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: "css-loader" }
        ]
    };

    const staticFilesLoader = {
        test: config.assets,
        loader: "file-loader",
        options: { name: "[name].[ext]" }
    };

    const fileLoader = {
        test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|woff2|wav|mp3)$/,
        loader: "file-loader",
        options: {
            name: `${templateName}.[ext]`
        },
        exclude: config.assets
    };

    const svgLoader = {
        test: /\.svg$/,
        loader: "file-loader",
        options: {
            name: `${templateName}.[ext]`
        },
        exclude: config.assets
    };

    const urlLoader = {
        test: /\.(jpe?g|png|gif|eot|woff|ttf|woff2|wav|mp3)$/,
        loader: "url-loader",
        options: {
            limit: 10000,
            name: `${templateName}.[ext]`
        },
        exclude: config.assets
    };

    return {
        mode: options.mode,
        resolve: {
            extensions: [ ".js", ".jsx" ],
            modules: [
                "node_modules",
                ... config.sourcePath ? path.resolve(config.sourcePath) : []
            ]
        },
        entry: {
            [name]: [
                '@babel/polyfill',
                ...[].concat(config.entry ||[]).map(p=>path.resolve(config.sourcePath||"", p)),
                ...[].concat(config.assets||[]).map(p=>path.resolve(config.sourcePath||"", p)),
            ],
            ...config.modules
        },
        output: {
            path: path.resolve(config.outputPath||name),
            filename:      `${templateChunkName}.js`,
            chunkFilename: `${templateChunkName}.js`
        },
        module: {
            rules: [
                jsxLoader,
                cssLoader,
                ...config.assets?[staticFilesLoader]:[],
                htmlLoader,
                ...options.mode=="development" ? [fileLoader] : [svgLoader,urlLoader]
            ]
        },
        ...( options.mode=="development" ? { devtool: config.devtool || 'source-map' } : {}),
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: indexHtmlTemplate,
                title: config.title||"Loading ...",
                ...(
                    options.mode=="development"
                    ? {}
                    : {
                        minify: {
                            collapseWhitespace: true,
                            removeComments: true,
                            removeRedundantAttributes: true,
                            removeScriptTypeAttributes: true,
                            removeStyleLinkTypeAttributes: true
                        }
                    }
                )
            }),
            new MiniCssExtractPlugin({ filename: `${templateChunkName}.css` })
        ]
    };
}
