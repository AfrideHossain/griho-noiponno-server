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

// route 3: add to cart
router.patch("/addtocart/:id", verifyJwt, async (req, res) => {
  const id = req.params.id;
  const quantity = req.body.quantity;
  const user = req.user;
  const previousCart = await users_collections.findOne(
    { email: user.email },
    { projection: { cart: 1 } }
  );

  const cart = [...previousCart.cart];
  if (cart.length > 0) {
    // check if the item is already in the cart or not if yes then increase it's quantity otherwise push new one into the array
    let isPresent = false;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].productid == id) {
        isPresent = true;
        cart[i]["quantity"] =
          parseInt(cart[i]["quantity"]) + parseInt(quantity);
      }
    }
    if (!isPresent) {
      cart.push({ productid: id, quantity });
    }
  } else {
    cart.push({
      productid: id,
      quantity,
    });
  }

  const updateCart = await users_collections.updateOne(
    { email: user.email },
    { $set: { cart } }
  );
  return res.send(updateCart);
});

// route 4: remove from cart
router.delete("/removefromcart/:index", verifyJwt, async (req, res) => {
  let userEmail = req.user.email;
  let removedIndex = parseInt(req.params.index);
  let cartData = await carts_collections
    .findOneAndUpdate(
      { userEmail },
      { $pull: { items: { _id: removedIndex } } }
    )
    .exec();
  return res.status(200).send(cartData.value.items);
});

module.exports = router;
