const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;

const verifyJwt = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).send({ error: "Invalid credentials" });
  }

  let token = authToken.split(" ")[1];
  try {
    const user = jwt.verify(token, jwt_secret);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send({ error: "Invalid credentials" });
  }
};

module.exports = verifyJwt;
