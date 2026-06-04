module.exports = {
  apps : [{
    name: "quizo-ws",
    script: "./dist/index.js",
    env_production: {
      NODE_ENV: "production",
      DB_CLIENT: "mysql"
    }
  }]
};