const express = require("express"); // it means get express

const app = express();//it means create a server
const PORT = 5000;// use port 5000 and it is basically the door 

app.get("/", (req, res) =>// when someone visit this homepage or link
{
  res.send("Hello from RealtimeChat server");
});// send this message

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});// start the server and listen on port 5000 