const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyJwt");
// mongo db collections
const user_collections = client.db("griho_naipunya").collection("users");

// route 1 : Save user info to db
router.post("/createuser", async (req, res) => {
  const userdata = req.body;
  const insertData = await user_collections.insertOne(userdata);
  return res.send(insertData);
});

// route 2 : sign jwt
router.post("/jwtSign", async (req, res) => {
  let userData = req.body;
  let token = jwt.sign(userData, process.env.JWT_SECRET);
  return res.send({ token });
});
// route 3 : fetch role
router.get("/user/role/:email", verifyJwt, async (req, res) => {
  const { email } = req.params;
  const currentUserEmail = req.user.email;

  // Check if the user making the request is authorized to access the given email
  if (currentUserEmail !== email) {
    return res.status(401).send({ error: "Unauthorized access" });
  }

  try {
    // Fetch user role from the database
    const user = await user_collections.findOne(
      { email },
      { projection: { _id: 0, role: 1 } }
    );

    // Send the role in the response
    res.send({ role: user.role });
  } catch (error) {
    // If there's an error while fetching user role, send a 500 Internal Server Error response
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
