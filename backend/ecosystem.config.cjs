/** PM2: cd backend && pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'ox-backend',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
