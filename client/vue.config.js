const {defineConfig} = require('@vue/cli-service')
const path = require("path");

module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: config => {
        config.resolve.alias
            .set('@common', path.resolve(__dirname, '../common'));
    },
    devServer: {
        allowedHosts: ['osucad.com']
    }
})
