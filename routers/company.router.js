const express = require("express");
const Company = require("../Models/Company");
const User = require("../Models/User");
const Address = require("../Models/Address");
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();

//adres create silip adresi burada oluşturuyorum. Düzenlemeler yapılabilir. Henüz test edilmedi.
router.post("/companies/create-company", authenticateUser, async (req, res) => {
  const companyData = req.body;
  try {
    const address = new Address(req.body.address);
    await address.save();
    companyData.address_id = address._id;
  } catch (e) {
    return res.status(400).send(e.message);
  }

  const company = new Company(companyData);
  const user = req.user;
  try {
    await company.save();
    user.company_id = company._id;
    user.role = "company_admin";
    await user.save();
    res.status(201).send(company);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find({});
    if (!companies) {
      throw new Error("No companies found");
    }
    res.status(201).send(companies);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/companies/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      throw new Error("No company found");
    }
    res.status(201).send(company);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/companies/:id", authenticateUser, async (req, res) => {
  const user = req.user;
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!company) {
      throw new Error("No company found");
    }
    if (company._id.toString() !== user.company_id.toString()) {
      throw new Error("You are not authorized to update this company");
    }
    res.status(201).send(company);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/companies/:id", authenticateUser, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    const user = req.user;
    if (!company) {
      throw new Error("No company found");
    }
    if (company._id.toString() !== user.company_id.toString()) {
      throw new Error("You are not authorized to delete this company");
    }
    res.status(201).send(company);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
  