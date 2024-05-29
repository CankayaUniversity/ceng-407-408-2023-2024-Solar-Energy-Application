const express = require("express");
const router = express.Router();
const SolarPanel = require("../Models/SolarPanel");

// Çatı ve panelleri ekleme
// Çatı ve panelleri ekleme
router.post("/solarpanels/create-solarpanels", async (req, res) => {
  try {
    const solarPanelData = req.body;
    console.log("req.body", req.body);

    // panelsToJSON verisini doğru formatta alıp almadığınızı kontrol edin
    if (!Array.isArray(solarPanelData.panelsToJSON)) {
      throw new Error("panelsToJSON should be an array");
    }

    // panelsToJSON verilerini doğru formatta saklayın
    solarPanelData.panelsToJSON = solarPanelData.panelsToJSON.map(panel => ({
      data: panel
    }));

    const solarPanel = new SolarPanel(solarPanelData);
    console.log("solarpanel", solarPanel);
    await solarPanel.save();
    res.status(201).send(solarPanel);
  } catch (error) {
    console.log("errorrr backend", error);
    res.status(400).send(error);
  }
});

// Tüm çatıları ve panelleri sorgulama
router.get("/solarpanels", async (req, res) => {
  try {
    const solarPanels = await SolarPanel.find();
    res.status(200).send(solarPanels);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Belirli bir çatıyı ve üzerindeki panelleri sorgulama
router.get("/solarpanels/:id", async (req, res) => {
  try {
    const solarPanel = await SolarPanel.findById(req.params.id);
    if (!solarPanel) {
      return res.status(404).send();
    }
    res.status(200).send(solarPanel);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Belirli bir çatıyı ve üzerindeki panelleri güncelleme
router.patch("/solarpanels/:id", async (req, res) => {
  try {
    const solarPanel = await SolarPanel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!solarPanel) {
      return res.status(404).send();
    }
    res.status(200).send(solarPanel);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
