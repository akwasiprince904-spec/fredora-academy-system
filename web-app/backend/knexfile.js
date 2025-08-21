const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'database/fredora_academy.db')
    },
    migrations: {
      directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    useNullAsDefault: true
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    ssl: { rejectUnauthorized: false },
    pool: {
      min: 2,
      max: 10
    }
  }
};