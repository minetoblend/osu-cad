// vue.config.js
module.exports = {
    chainWebpack: config => {
        const imgRule = config.module.rule('images')
        imgRule.uses.clear()
        imgRule.use('file-loader')
            .loader('file-loader')

    },
    /*configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.(png|jpg|gif)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: false,
                            },
                        },
                    ]
                }
            ]
        }
    }*/
}
