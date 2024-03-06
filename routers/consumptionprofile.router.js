const express = require("express");
const Customer = require("../Models/Customer");
const ConsumptionProfile = require("../Models/ConsumptionProfile");
const router = express.Router();

router.post("/consumption/create-consumption", async (req, res) => {
  const consumptionData = req.body;
  const consumptionprofile = new ConsumptionProfile(consumptionData);
  try {
    await consumptionprofile.save();
    res.status(201).send(consumptionprofile);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/consumption", async (req, res) => {
  try {
    const queryParams = req.query;
    console.log("consumptionquary: ", queryParams);
    const consumptionprofile = await ConsumptionProfile.find(queryParams);
    if (!consumptionprofile) {
      throw new Error("No consumptionprofile found");
    }
    res.status(201).send(consumptionprofile);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/consumption/:id", async (req, res) => {
  try {
    const consumptionprofile = await ConsumptionProfile.findById(req.params.id);
    if (!consumptionprofile) {
      throw new Error("No consumptionprofile found");
    }
    res.status(201).send(consumptionprofile);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/consumption/:id", async (req, res) => {
    const consumptionprofile = req.consumptionprofile;
    try {
      const consumptionprofile = await ConsumptionProfile.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!consumptionprofile) {
        throw new Error("No consumptionprofile found");
      }
      res.status(201).send(consumptionprofile);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });

router.delete("/consumption/:id", async (req, res) => {
  try {
    const consumptionprofile = await ConsumptionProfile.findByIdAndDelete(req.params.id);
    if (!consumptionprofile) {
      throw new Error("No consumptionprofile found");
    }
    res.status(201).send(consumptionprofile);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
