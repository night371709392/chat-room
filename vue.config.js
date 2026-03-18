const { defineConfig } = require('@vue/cli-service')

module.exports = {
  // 开发服务器配置
  devServer: {
    open: false, // 启动服务后是否自动打开浏览器
    host: 'localhost', // 本地域名
    port: 8080, // 前端服务端口（可自定义，如3000）
    proxy: {
      // 匹配所有以 /api 开头的请求
      '/api': {
        target: 'http://192.168.1.119:8081', // 后端服务的地址+端口（必填！改你的后端地址）
        changeOrigin: true, // 开启跨域（关键，必须设为true）
        ws: true, // 支持WebSocket（可选，如不需要可删）
        pathRewrite: { 
          // 路径重写：如果后端接口没有 /api 前缀，就把前端请求的 /api 去掉
          // 例：前端请求 /api/user/list → 转发到后端 http://localhost:8081/user/list
          '^/api': '' 
        }
      },
      // 可选：配置多个代理（如还有 /upload 前缀的请求）
      '/upload': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
};
