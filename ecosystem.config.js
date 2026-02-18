module.exports = {
  apps: [{
    name: 'meal-planner-api',
    script: 'server/src/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    instances: 1,
    autorestart: true,
    watch: ['server/src'],
    watch_delay: 1000,
    ignore_watch: ['node_modules', 'client', '.git'],
    max_memory_restart: '256M',
  }]
};
