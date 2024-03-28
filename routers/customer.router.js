const express = require("express");
const Address = require("../Models/Address");
const Customer = require("../Models/Customer");
const User = require("../Models/User");
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();
//DIGITURK MUSTERI MANTIĞIYLA ID BAĞLAMAYI YAP

router.post(
  "/customers/create-customer",
  authenticateUser,
  async (req, res) => {
    console.log("reqqq", req.body);
    const customerData = req.body;
    try {
      const address = req.body.address;

     
      const coordinates = await getCoordinatesFromAddress(address);

      customerData.latitude = coordinates.latitude;
      customerData.longitude = coordinates.longitude;

      const newAddress = new Address(address);
      await newAddress.save();
      customerData.address_id = newAddress._id;

      // Mevcut kullanıcının şirket bilgisini al
      const currentUser = req.user;
      console.log("currr", currentUser);

      // Yeni müşteri verisine şirket bilgisini ekle
      customerData.company_id = currentUser.company_id;
    } catch (e) {
      return res.status(400).send(e.message);
    }

    const customer = new Customer(customerData);
    try {
      await customer.save();
      res.status(201).send(customer);
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);


router.get("/customers", async (req, res) => {
  try {
    const queryParams = req.query
    console.log("asdsa",queryParams)
    const customers = await Customer.find(queryParams);
    if (!customers) {
      throw new Error("No customer found");
    }
    res.status(201).send(customers);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const customers = await Customer.findById(req.params.id);
    if (!customers) {
      throw new Error("No customer found");
    }
    res.status(201).send(customers);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/customers/:id", async (req, res) => {
  const customer = req.customer;
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer) {
      throw new Error("No company found");
    }
    res.status(201).send(customer);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    const user = req.user;
    
    if (!customer) {
      throw new Error("No customer found");
    }
    if (user.company_id.toString() !== customer.company_id.toString()) {
      throw new Error("You are not authorized to delete this company");
    }
    res.status(201).send(customer);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
