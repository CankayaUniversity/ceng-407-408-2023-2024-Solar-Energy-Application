const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const SolarPanelSchema = new Schema({
  roofImage: String,
  currentZoom: Number,
  currentCenter: {
    lat: Number,
    lng: Number,
  },
  panelsToJSON: [
    {
      data: mongoose.Schema.Types.Mixed,
    },
  ],
});

const SolarPanel = mongoose.model("SolarPanel", SolarPanelSchema);

module.exports = SolarPanel;
