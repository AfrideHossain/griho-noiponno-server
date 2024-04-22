const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { connectMongo, client } = require("./mongoDbConnection");
const { Server } = require("socket.io");
require("dotenv").config();
const port = process.env.PORT || 5000;

// verification middlewares
const verifyJwt = require("./routes/middlewares/verifyJwt");
const adminVerify = require("./routes/middlewares/adminVerify");
const { ObjectId } = require("mongodb");
const { read } = require("fs");

// orders collection
const ordersCollection = client.db("griho_naipunya").collection("orders");

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

// create server
const server = http.createServer(app);

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

/************************
 * Socket related codes *
 *************************/

// create io server
const io = new Server(server, {
  cors: "*",
  // allow socket to access cookies
  // cookie: true,
});

const clientList = [];
// write getSocketByUserId function to get socket by user id
const getSocketByUserId = (userId) => {
  const client = clientList.find((client) => client.userId === userId);
  return client ? client.socket : null;
};

// on connection
io.on("connection", (socket) => {
  console.log("A user connected with socket id: ", socket.id);
  socket.on("loggedin", (userinfo) => {
    // console.log("event fired with: ", userinfo);
    // check client is already exist or not. if not then add to client list
    const client = clientList.find(
      (client) => client.userId === userinfo.userId
    );
    if (!client) {
      clientList.push({
        ...userinfo,
        socket,
      });
    }
    // console.log("client list: ", clientList);
  });
  // on new message event
  socket.on("newMessage", (message) => {
    console.log("new message event fired with: ", message);
    // get receiver socket
    const receiverSocket = getSocketByUserId(message.receiverId);
    if (receiverSocket) {
      receiverSocket.emit("newMessage", message);
    }
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected with socket id: ", socket.id);
    //remove client from client list
    const client = clientList.find((client) => client.socket.id === socket.id);
    if (client) {
      clientList.splice(clientList.indexOf(client), 1);
    }
    // console.log("client list: ", clientList);
  });
});

// handle new orders
app.post("/neworder", verifyJwt, async (req, res) => {
  const orderDetails = req.body;
  const newOrder = await ordersCollection.insertOne(orderDetails);
  if (newOrder.insertedId) {
    io.emit("neworder", { orederid: newOrder.insertedId });
    return res.status(200).send(newOrder);
  }
  return res.status(400).send({ message: "Something went wrong" });
});

// fetch orders
app.get("/getneworders", verifyJwt, adminVerify, async (req, res) => {
  const allOrders = await ordersCollection
    .find({}, { sort: { orderedDate: -1 } })
    .toArray();
  return res.send(allOrders);
});
//fetch pending orders
app.get("/pendingorders", verifyJwt, adminVerify, async (req, res) => {
  const pendingOrders = await ordersCollection
    .find({ status: "pending" }, { sort: { orderedDate: -1 } })
    .toArray();
  return res.send(pendingOrders);
});
// get order
app.get("/order/:orderId", verifyJwt, adminVerify, async (req, res) => {
  const { orderId } = req.params;
  const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
  if (order) {
    return res.send(order);
  }
  return res.status(400).send({ message: "Something went wrong" });
});

// TODO: update order status
app.patch("/orderstatus", async (req, res) => {
  const { orderId } = req.query;
  const { status } = req.body;
  // console.log({ id, status });
  try {
    const updateOrderStatus = await ordersCollection.updateOne(
      {
        _id: new ObjectId(orderId),
      },
      { $set: { status } }
    );
    if (updateOrderStatus.modifiedCount > 0) {
      return res
        .status(200)
        .json({ success: true, msg: "order status changed" });
    } else {
      return res.status(404).send("order not found");
    }
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});

server.listen(port, () => {
  console.log(`Griho naipunya listening on port ${port}`);
});
