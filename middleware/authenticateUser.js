const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "erhansekreter");

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Kimlik doğrulama gereklidir." });
  }
};

module.exports = authenticateUser;
