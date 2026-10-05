const jwt = require("jsonwebtoken"); // import library to verify jwt tokens

function verifyToken(req, res, next) {  // function to verify the token sent by the client in the request header
  const header = req.headers.authorization; // get the authorization header from the request

  if (!header || !header.startsWith("Bearer ")) { // check if the header is present and starts with "Bearer "
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];  // extract the token 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify the token using the secret key in env var 
    req.userId = decoded.id; // The authenticated user making this request is user id 
    next(); // call the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" }); // if there is error and next not called 
  }
}

module.exports = verifyToken; // export the function