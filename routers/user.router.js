const express = require("express");
const User = require("../Models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/users/register", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.status(200).send("User logged out");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    console.log(users);
    if (!users) {
      throw new Error("No users found");
    }
    res.status(201).send(users);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/users/profile", auth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error("User not found!");
    }
    res.status(201).send(user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
//.password !== req.body.password
router.patch("/users/:id", auth, async (req, res) => {
  try {
    const thisUser = await User.findById(req.params.id);

    if (thisUser.password !== req.body.password) {
      const bcryptedPassword = await bcrypt.hash(req.body.password, 8);
      req.body.password = bcryptedPassword;
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new Error("User not found!");
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new Error("User not found!");
    }
    res.status(200).send("User deleted");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
