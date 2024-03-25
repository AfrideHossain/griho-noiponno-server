const { client } = require("../../mongoDbConnection");

const user_collections = client.db("griho_naipunya").collection("users");

const adminVerify = async (req, res, next) => {
  const email = req.user.email;
  const fetchUser = await user_collections.findOne(
    { email: email },
    { projection: { role: 1 } }
  );
  if (fetchUser.role === "admin") {
    next();
  } else {
    return res.status(401).send({ error: "unauthorized access" });
  }
};

module.exports = adminVerify;
