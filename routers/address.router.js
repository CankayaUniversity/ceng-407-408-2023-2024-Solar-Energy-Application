const express = require("express");
const User = require("../Models/User");
const Address = require("../Models/Address");
const Company = require("../Models/Company");
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();

// router.post("/addresses/create-address", async (req, res) => {
//   const address = new Address(req.body);
//   try {
//     await address.save();
//     res.status(201).send(address);
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });

router.get("/addresses", async (req, res) => {
  try {
    const addresses = await Address.find({});
    if (!addresses) {
      throw new Error("No addresses found");
    }
    res.status(201).send(addresses);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/addresses/:id", async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      throw new Error("No address found");
    }
    res.status(201).send(address);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/addresses/:id", authenticateUser, async (req, res) => {
  const user = req.user;
  const company = await Company.findById(user.company_id);

  if (company.address_id.toString() === req.params.id.toString()) {
    try {
      const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!address) {
        throw new Error("No address found");
      }
      res.status(201).send(address);
    } catch (e) {
      res.status(500).send(e.message);
    }
  } else {
    res.status(401).send("You are not authorized to update this address");
  }
});

router.delete("/addresses/:id", authenticateUser, async (req, res) => {
  const user = req.user;
  const company = await Company.findById(user.company_id);
  if (company.address_id.toString() === req.params.id.toString()) {
    try {
      const address = await Address.findByIdAndDelete(req.params.id);
      if (!address) {
        throw new Error("No address found");
      }
      res.status(201).send(address);
    } catch (e) {
      res.status(500).send(e.message);
    }
  } else {
    res.status(401).send("You are not authorized to delete this address");
  }
});

module.exports = router;
