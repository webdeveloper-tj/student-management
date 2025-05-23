const express = require("express");
const cors = require("cors");
const app = express();
const studentsRoutes = require("./routes/ students");
const categorias = require("./routes/categorias");

app.use(cors());
app.use(express.json());

app.use("/api/students", studentsRoutes);
app.use("/api/categorias", categorias);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/test", (req, res) => {
  res.json({ message: "POST request works" });
});
