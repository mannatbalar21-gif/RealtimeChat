require("dotenv").config(); // This loads your environment variables from a file called .env.
const express = require("express"); // it means get express

const app = express();//it means create a server
app.use(express.json()); // Understand JSON sent by the client. JSON = JavaScript Object Notation.(like struct format)
app.use("/api/auth", require("./routes/authRoutes"));
const PORT = process.env.PORT || 5000; // Choose the server's port; use 5000 if none is provided.(process nodejs obj) 

app.get("/", (req, res) =>// when someone visit this homepage or link
{
  res.send("Hello from RealtimeChat server");
});// send this message

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});// start the server and listen on port 5000 