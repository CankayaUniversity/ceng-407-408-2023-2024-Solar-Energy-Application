const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const validator = require("validator");

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  address_id: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },
  company_id: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  vat_number: {
    type: String,
    required: true,
  },
  vat_office: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
},
{timestamps: true}
);



const Customer = mongoose.model("Customer",CustomerSchema);
module.exports = Customer;