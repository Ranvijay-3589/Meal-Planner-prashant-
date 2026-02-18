module.exports = {
  apps: [{
    name: 'meal-planner-api',
    script: 'server/src/server.js',
    cwd: '/home/cmdcmd007/projects/meal-planner',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '256M',
  }]
};
