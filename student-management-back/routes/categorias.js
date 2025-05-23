const express = require("express");
const router = express.Router();
const db = require("../db/database.js");

router.get("/sexes", (req, res) => {
  db.all("SELECT * FROM sexes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/faculties", (req, res) => {
  db.all("SELECT * FROM faculties", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/kafedras", (req, res) => {
  db.all("SELECT * FROM kafedras", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get("/regions", (req, res) => {
  db.all("SELECT * FROM regions", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/statuses", (req, res) => {
  db.all("SELECT * FROM statuses", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/groups", (req, res) => {
  db.all("SELECT * FROM groups", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/nationalities", (req, res) => {
  db.all("SELECT * FROM nationalities", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/education_types", (req, res) => {
  db.all("SELECT * FROM education_types", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get("/farmon/:id", (req, res) => {
  const id = req.params.id;

  db.all("SELECT * FROM farmon WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0)
      return res.status(404).json({ error: "Farmon not found" });

    res.json(rows);
  });
});

router.put("/farmon/:id", (req, res) => {
  const id = req.params.id;
  const { month, day, number, type_farmon, modda } = req.body;

  if (!month || !day || !number || !type_farmon || !modda) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    UPDATE farmon
    SET month = ?, day = ?, number = ?, type_farmon = ?, modda = ?
    WHERE farmon_id = ?
  `;
  const params = [month, day, number, type_farmon, modda, id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: "Farmon not found" });
    }

    res.json({ message: "Farmon updated successfully" });
  });
});

router.post("/farmon", (req, res) => {
  const { id, month, day, number, type_farmon, modda, order } = req.body;
  if (!id || !month || !day || !number || !type_farmon || !modda || !order) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
  INSERT INTO farmon (id, month, day, number, type_farmon, modda, "order")
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;
  const params = [id, month, day, number, type_farmon, modda, order];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "Farmon created", id: this.lastID });
  });
});

module.exports = router;
