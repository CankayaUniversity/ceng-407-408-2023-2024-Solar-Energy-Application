const express = require('express');
const router = express.Router();
const SolarPanel = require('../Models/SolarPanel');

// Çatı ve panelleri ekleme
router.post('/solarpanels/create-solarpanels', async (req, res) => {
  try {
    const solarPanel = new SolarPanel(req.body);
    await solarPanel.save();
    res.status(201).send(solarPanel);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Tüm çatıları ve panelleri sorgulama
router.get('/solarpanels', async (req, res) => {
  try {
    const solarPanels = await SolarPanel.find();
    res.status(200).send(solarPanels);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Belirli bir çatıyı ve üzerindeki panelleri sorgulama
router.get('/solarpanels/:id', async (req, res) => {
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
router.patch('/solarpanels/:id', async (req, res) => {
  try {
    const solarPanel = await SolarPanel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!solarPanel) {
      return res.status(404).send();
    }
    res.status(200).send(solarPanel);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
