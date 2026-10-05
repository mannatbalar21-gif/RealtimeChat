const express = require("express"); // get express
const bcrypt = require("bcryptjs"); // get bcryptjs for hashing passwords
const jwt = require("jsonwebtoken"); // Import the JWT library so my backend can create and verify login tokens.
const verifyToken = require("../middleware/verifyToken"); // Go one folder up, then go into middleware, then get verifyToken.js.
const pool = require("../db");// connect to the database

const router = express.Router();// create a router for handling authentication routes

router.post("/register", async (req, res) => { // If someone sends a POST request to /register, run this function
  const { username, email, password } = req.body; // Get the username, email, and password from the request body

  if (!username || !email || !password) { // If any of the fields are missing, return a 400 status code with an error message
    return res.status(400).json({ message: "All fields are required" });
  }

  try { // 
    const hash = await bcrypt.hash(password, 10); // Hash the password with a salt of 10 rounds
    const result = await pool.query( // insert the user into db and return 
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hash]
    );
    res.status(201).json(result.rows[0]); // Return the newly created user (without the password)
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Username or email already taken" });
    }
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => { // if someone send a post req to login use this func 
  const { email, password } = req.body; // get data from req body 

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" }); // if any field is missing return err 
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]); // find user in db with emaail 
    const user = result.rows[0]; // get the first user from the result

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // if user not found return err
    }

    const match = await bcrypt.compare(password, user.password_hash); // compare pass with hashed pass in db 
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" }); // if pass not match return err
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" }); // create a jwt token with user id and secret key from env var and set expiry to 7 days
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    }); // return the token and user data (without password)
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" }); // return if error
  }
});
router.get("/me", verifyToken, async (req, res) => { // when someone sends reqq to me (current user) verify the token then use this funcc 
  try {
    const result = await pool.query( 
      "SELECT id, username, email, profile_picture FROM users WHERE id = $1", // find user id sme as auth user id 
      [req.userId]
    );
    if (!result.rows[0]) { // if user not found 
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]); // return user data without password
  } catch (err) { // if error 
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router; // Export the router 