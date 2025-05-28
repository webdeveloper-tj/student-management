const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../db", "ms.db");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    process.exit(1); // Stop execution if DB doesn't exist
  }
});

module.exports = db;
