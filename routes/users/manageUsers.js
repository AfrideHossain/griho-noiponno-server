const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyJwt");
// const adminVerify = require("../middlewares/adminVerify");
// mongo db collections
const users_collections = client.db("griho_naipunya").collection("users");

// route 1 : Update user
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
      return res
        .status(200)
        .send({ success: true, message: "Update Successfully!" });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "No changes detected." });
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
  } catch (error) {
    return res.send(error.message);
  }
});
// get user's availability 
// router.get("/availability", verifyJwt, async (req, res) => {

// }

// route 3: add to cart
router.patch("/addtocart/:id", verifyJwt, async (req, res) => {
  const id = req.params.id;
  const quantity = req.body.quantity;
  const user = req.user;
  const previousCart = await users_collections.findOne(
    { email: user.email },
    { projection: { cart: 1 } }
  );
  console.log(previousCart.cart);
  const cart = [...(previousCart?.cart || [])];
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
router.delete("/removefromcart/:id", verifyJwt, async (req, res) => {
  let userEmail = req.user.email;
  let removedId = req.params.id;

  try {
    const existingCart = await users_collections.findOne(
      { email: userEmail },
      { projection: { cart: 1 } }
    );
    // check if the item to be deleted exists in the cart or not
    /* if (existingCart.cart.some((item) => item.productid === removedId)) {
    const updatedCart = existingCart.cart.filter((item) => item.productid !== removedId);
    await users_collections.updateOne(
      { email: userEmail },
      { $set: { cart: updatedCart } }
    ).then(() => {
      console.log(`Item with ID ${removedId} has been successfully removed from the Cart.`);
      return res.status(200).json("Successfully Removed");
    }).catch((err) => {
      console.error(err);
      return res.status(500).json("Server Error");
    })
  } else {
    return res.status(400).json("The Item is Not Present in Your Cart.");
  } */
    console.log("User's existing cart=> ", existingCart);
    const updatedCart = existingCart.cart.filter(
      (item) => item.productid !== removedId
    );
    console.log("Updated cart => ", updatedCart);

    const updateUserCart = await users_collections.updateOne(
      { email: userEmail },
      { $set: { cart: updatedCart } }
    );
    console.log(updateUserCart);
    if (updateUserCart.modifiedCount > 0) {
      return res.status(200).json({
        success: true,
        message: `Product has been removed from your cart`,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "No product found with provided id" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }

  return res.status(200).send("Item has been successfully removed");
});

//  route 5: get cart of a specific user
router.get("/cart", verifyJwt, async (req, res) => {
  const user = req.user;
  try {
    const cartData = await users_collections.findOne(
      { email: user.email },
      { projection: { cart: 1 } }
    );

    return res.send(cartData);
  } catch (err) {
    return res.status(403).json({ msg: "Error getting data" });
  }
});

module.exports = router;
