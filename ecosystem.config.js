module.exports = {
  apps: [
    {
      name: "my-web-app",
      cwd: "./backend",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
