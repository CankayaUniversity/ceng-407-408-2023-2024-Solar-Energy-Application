const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  house_number: {
    type: String,
    required: true,
  },
  addition: {
    type: String,
    required: false,
  },
  postcode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: false,
  },
  longitude: {
    type: String,
    required: false,
  },
});

const Address = mongoose.model("Address", AddressSchema);
module.exports = Address;
