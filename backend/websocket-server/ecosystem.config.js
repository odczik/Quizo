module.exports = {
  apps: [
    {
      name: "Quizo websocket",
      script: "index.js",   // or your entry file
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
