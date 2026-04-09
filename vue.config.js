const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    open: false,
    host: 'localhost',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://192.168.0.158:8081',  // 后端HTTPS地址
        changeOrigin: true, // 跨域必备
        ws: true,
        pathRewrite: {'^/api': ''},
        secure: false // 忽略HTTPS证书错误（本地开发用）
      }
    }
  }
})