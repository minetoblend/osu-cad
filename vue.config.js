const Dotenv = require('dotenv-webpack');

module.exports = {
    chainWebpack: config => {
        const imgRule = config.module.rule('images')
        imgRule.uses.clear()
        imgRule.use('file-loader')
            .loader('file-loader')

    },
    configureWebpack: {
        plugins: [
            new Dotenv()
        ],
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `
                    @import "@/_variables.scss";
                `
            }
        },
    },
    devServer: {
        disableHostCheck: true,
        public: 'https://osucad.com/',
        port: 8080
    }
}
