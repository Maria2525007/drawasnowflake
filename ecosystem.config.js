module.exports = {
  apps: [
    {
      name: 'drawasnowflake-backend',
      script: 'dist/server.js',
      cwd: '/var/www/drawasnowflake.online/backend',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--import ./dist/instrument.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '127.0.0.1',
        SENTRY_DSN: 'https://2f4095cb1c80b0bf418c59b4ae5eb244@o4510590461935616.ingest.de.sentry.io/4510590620401744'
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};

