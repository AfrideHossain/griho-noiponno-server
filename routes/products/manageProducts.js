const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyJwt");
const adminVerify = require("../middlewares/adminVerify");
// mongo db collections
const products_collections = client.db("griho_naipunya").collection("products");

// route 1 : Add new product
router.post("/addproduct", verifyJwt, adminVerify, async (req, res) => {
  try {
    const productInfo = req.body;
    let addClass = await products_collections.insertOne(productInfo);
    return res.send(addClass);
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
