const express = require("express");
const app = express();
const cors = require("cors");
const { connectMongo } = require("./mongoDbConnection");
require("dotenv").config();
const port = process.env.PORT || 5000;

//call mongodb connection function
connectMongo();

// cors and cors configuration
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

//json middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Griho naipunya is running well...");
});

// auth route
app.use("/", require("./routes/authentication/auth"));
// manage products route
app.use("/products", require("./routes/products/manageProducts"));
// manage users route
app.use("/users", require("./routes/users/manageUsers"));
// manage payments route
// app.use("/", require("./routes/managePayments/managePayments"));

app.listen(port, () => {
  console.log(`Griho naipunya listening on port ${port}`);
});
