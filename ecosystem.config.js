module.exports = {
  apps: [{
    name: 'diary-backend',
    cwd: './backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5001,
    },
  }],
};
