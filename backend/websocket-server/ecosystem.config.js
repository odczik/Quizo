module.exports = {
  apps: [
    {
      name: "Quizo websocket",
      script: "dist/index.js",   // or your entry file
      instances: 1,
      cwd: __dirname,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
