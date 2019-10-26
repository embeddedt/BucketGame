const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function isProduction(env) {
    return typeof env != 'undefined' && env.production;
}
module.exports = env => { return {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                        plugins: [ '@babel/plugin-transform-arrow-functions', "@babel/plugin-transform-classes", '@babel/plugin-transform-block-scoping', '@babel/plugin-transform-parameters', '@babel/plugin-transform-destructuring', 'babel-plugin-transform-es2015-shorthand-properties', '@babel/plugin-transform-template-literals' ]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
        alias: {
            'material-ui': 'material-ui/es',
        }
    },
    entry: './script.jsx',
    mode: isProduction(env) ? 'production' : 'development',
    output: {
        filename: 'core_script_compiled.js',
        path: __dirname
    },
    devtool: isProduction(env) ? false : 'source-map',
    optimization: {
        usedExports: true,
        concatenateModules: isProduction(env)
    },
    externals: {
        react: 'React',
        "react-dom": 'ReactDOM'
    },
    plugins: [
    ]
}};