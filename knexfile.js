var config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.SERVERCRAFT_DB || './servercraft.sqlite'
  }
};

module.exports = {production: config, development: config};
