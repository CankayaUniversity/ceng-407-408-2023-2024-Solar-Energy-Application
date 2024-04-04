const mongoose = require('mongoose');

const solarPanelSchema = new mongoose.Schema({
  roofImage: String,
  panels: [{
    angle: Number,
    rotation: Number,
    position: {
      x: Number,
      y: Number
    }
  }]
});

module.exports = mongoose.model('SolarPanel', solarPanelSchema);
