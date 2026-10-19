import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          login: path.resolve(__dirname, 'login.html'),
          register: path.resolve(__dirname, 'register.html'),
          monthly_plan: path.resolve(__dirname, 'monthly-plan.html'),
          transactions: path.resolve(__dirname, 'transactions.html'),
          budgets: path.resolve(__dirname, 'budgets.html'),
          savings_goals: path.resolve(__dirname, 'savings-goals.html'),
          reports: path.resolve(__dirname, 'reports.html'),
          profile: path.resolve(__dirname, 'profile.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

