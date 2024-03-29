const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyJwt");
// const adminVerify = require("../middlewares/adminVerify");
// mongo db collections
const users_collections = client.db("griho_naipunya").collection("users");

// route 1 : Add new product
router.patch("/updateuser", verifyJwt, async (req, res) => {
  try {
    const userInfo = req.body;
    const user = req.user;
    const newUserObj = {};
    for (const key in userInfo) {
      if (userInfo[key]) {
        newUserObj[key] = userInfo[key];
      }
    }
    const updateUser = await users_collections.updateOne(
      { email: user.email },
      {
        $set: newUserObj,
        $currentDate: { lastModified: true },
      }
    );
    if (updateUser.modifiedCount > 0) {
      return res.status(200).send({ message: "Update Successfully!" });
    } else {
      return res.status(400).send({ message: "No changes detected." });
    }
  } catch (error) {
    return res.send(error.message);
  }
});

// route 2: Get user's information
router.get("/profile", verifyJwt, async (req, res) => {
  try {
    const user = req.user;
    const userProfile = await users_collections.findOne({ email: user.email });
    return res.send(userProfile);
  } catch (error) {}
});

module.exports = router;
