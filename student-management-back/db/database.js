const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Absolute path to the existing database file
const dbPath = path.resolve(__dirname, "../db", "ms.db");

// Connect to the existing database in read/write mode (won’t create a new one if missing)
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    process.exit(1); // Stop execution if DB doesn't exist
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      [],
      (err, rows) => {
        if (err) {
          console.error("Error fetching tables:", err.message);
          return;
        }
      }
    );
  }
});

module.exports = db;
