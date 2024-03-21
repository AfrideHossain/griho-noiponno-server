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
// manage classes route
// app.use("/", require("./routes/manageClasses/manageClasses"));
// manage users route
// app.use("/", require("./routes/manageUsers/manageUsers"));
// manage payments route
// app.use("/", require("./routes/managePayments/managePayments"));

app.listen(port, () => {
  console.log(`Aperture Academy listening on port ${port}`);
});
