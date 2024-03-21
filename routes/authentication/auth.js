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
  res.send(insertData);
});

// route 2 : sign jwt
router.post("/jwtSign", async (req, res) => {
  let userData = req.body;
  let token = jwt.sign(userData, process.env.JWT_SECRET);
  res.send({ token });
});
// route 3 : fetch role
router.get("/user/role/:email", verifyJwt, async (req, res) => {
  let userEmail = req.params.email;
  if (req.user.email !== userEmail) {
    return res.status(401).send({ error: "Unauthorized access" });
  }
  let role = await user_collections.findOne(
    { email: userEmail },
    { projection: { _id: 0, role: 1 } }
  );
  return res.send({ role });
});

module.exports = router;
