const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    vat_number: {
      type: String,
      required: true,
    },
    address_id: {
      type: Schema.Types.ObjectId,
      ref: "Address ",
    },
    // logo: {
    //   type: String,
    // },
    vat_office: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
