const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Username or email already taken" });
    }
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, profile_picture FROM users WHERE id = $1",
      [req.userId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;