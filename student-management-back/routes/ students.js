const express = require("express");
const router = express.Router();
const db = require("../db/database.js");
// GET all Student
router.get("/", (req, res) => {
  db.all("SELECT * FROM Student", [], (err, rows) => {
    // Changed from students to Student
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM Student WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Student not found" });
    res.json(row);
  });
});
// POST new student
// POST new student with duplicate checks
router.post("/", (req, res) => {
  const data = req.body;

  // First check for existing email and passport number
  const checkQuery = `
    SELECT COUNT(*) as count FROM Student 
    WHERE email = ? OR passport_number = ?
  `;

  db.get(checkQuery, [data.email, data.passport_number], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row.count > 0) {
      // Check which one exists
      db.get(
        "SELECT email FROM Student WHERE email = ?",
        [data.email],
        (err, emailRow) => {
          if (err) return res.status(500).json({ error: err.message });
          if (emailRow) {
            return res.status(400).json({
              error: "Email already exists",
              field: "email",
            });
          } else {
            db.get(
              "SELECT passport_number FROM Student WHERE passport_number = ?",
              [data.passport_number],
              (err, passportRow) => {
                if (err) return res.status(500).json({ error: err.message });

                return res.status(400).json({
                  error: "Passport number already exists",
                  field: "passport_number",
                });
              }
            );
          }
        }
      );
      return;
    }

    // If no duplicates, proceed with insertion
    const insertQuery = `
      INSERT INTO Student (
        first_name, last_name, middle_name, birth_date, sex, passport_number, nationality_id,
        region_id, address, phone_number, email, faculty_id, kafedra_id, group_id, course,
        study_year, education_type_id, enrollment_date, graduation_date, status_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.first_name,
      data.last_name,
      data.middle_name,
      data.birth_date,
      data.sex,
      data.passport_number,
      data.nationality_id,
      data.region_id,
      data.address,
      data.phone_number,
      data.email,
      data.faculty_id,
      data.kafedra_id,
      data.group_id,
      data.course,
      data.study_year,
      data.education_type_id,
      data.enrollment_date,
      data.graduation_date,
      data.status_id,
    ];

    db.run(insertQuery, values, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ...data });
    });
  });
});

// PUT update student
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const checkQuery = `
    SELECT COUNT(*) as count FROM Student 
    WHERE email = ? OR passport_number = ?
  `;
  db.get(checkQuery, [data.email, data.passport_number], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row.count > 0) {
      // Check which one exists
      db.get(
        "SELECT email FROM Student WHERE email = ?",
        [data.email],
        (err, emailRow) => {
          if (err) return res.status(500).json({ error: err.message });
          if (emailRow) {
            return res.status(400).json({
              error: "Email already exists",
              field: "email",
            });
          } else {
            db.get(
              "SELECT passport_number FROM Student WHERE passport_number = ?",
              [data.passport_number],
              (err, passportRow) => {
                if (err) return res.status(500).json({ error: err.message });

                return res.status(400).json({
                  error: "Passport number already exists",
                  field: "passport_number",
                });
              }
            );
          }
        }
      );
      return;
    }

    const query = `
    UPDATE Student SET
      first_name = ?, last_name = ?, middle_name = ?, birth_date = ?, sex = ?,
      passport_number = ?, nationality_id = ?, region_id = ?, address = ?, phone_number = ?,
      email = ?, faculty_id = ?, kafedra_id = ?, group_id = ?, course = ?, study_year = ?,
       education_type_id = ?, enrollment_date = ?, graduation_date = ?, status_id = ?
    WHERE id = ?
  `;
    const values = [
      data.first_name,
      data.last_name,
      data.middle_name,
      data.birth_date,
      data.sex,
      data.passport_number,
      data.nationality_id,
      data.region_id,
      data.address,
      data.phone_number,
      data.email,
      data.faculty_id,
      data.kafedra_id,
      data.group_id,
      data.course,
      data.study_year,

      data.education_type_id,
      data.enrollment_date,
      data.graduation_date,
      data.status_id,
      id,
    ];

    db.run(query, values, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ id: Number(id), ...data });
    });
  });
});

// DELETE student
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM Student WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Add these new routes before your POST and PUT routes

// Check if email exists
router.get("/check-email", (req, res) => {
  const email = req.query.email;
  if (!email)
    return res.status(400).json({ error: "Email parameter is required" });

  db.get(
    "SELECT COUNT(*) as count FROM Student WHERE email = ?",
    [email],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ exists: row.count > 0 });
    }
  );
});

// Check if passport exists
router.get("/check-passport", (req, res) => {
  const passport = req.query.passport;
  if (!passport)
    return res.status(400).json({ error: "Passport parameter is required" });

  db.get(
    "SELECT COUNT(*) as count FROM Student WHERE passport_number = ?",
    [passport],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ exists: row.count > 0 });
    }
  );
});
module.exports = router;
