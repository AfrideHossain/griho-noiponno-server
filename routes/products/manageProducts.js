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
    let addProduct = await products_collections.insertOne(productInfo);
    return res.send(addProduct);
  } catch (error) {
    return res.send(error.message);
  }
});

// route 2: get all products
router.get("/allproducts", verifyJwt, async (req, res) => {
  try {
    // Get data from database
    let showAllProducts = await products_collections.find().toArray();
    // Send the data to user
    return res.status(200).send(showAllProducts);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

// route 3 : update a product
router.put("/updateproduct/:id", verifyJwt, adminVerify, async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  if (!ObjectID.isValid(id))
    return res.status(404).send(`No record with given ID`);

  try {
    let result = await products_collections.updateOne(
      { _id: ObjectID(id) },
      { $set: updatedData }
    );
    if (!result || !result.modifiedCount)
      return res.status(400).send(`Failed to update the product.`);
    else
      return res.status(200).send(`The product has been successfully updated.`);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// route 4 : delete a product
router.delete("/deleteproduct/:id", verifyJwt, adminVerify, (req, res) => {
  const prodId = req.params.id;

  products_collections
    .deleteOne({ _id: ObjectID(prodId) })
    .then((data) => {
      if (!data || data.deletedCount == 0) {
        return res.status(404).send("No Record Found");
      } else {
        res.status(200).send("Product Has Been Deleted!");
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

module.exports = router;
