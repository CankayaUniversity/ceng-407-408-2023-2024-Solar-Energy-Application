const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const { float } = require("webidl-conversions");

const ConsumptionProfileSchema = new Schema ({
    date: {
        type: Date,
        required: true,
    },
    energy_consumed: {
        type: Number,
        required: true,
    },
    device_name: {
        type: String,
        required: true,
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: "ConsumptionProfile",
    },
},
{timestamps: true}
);

const ConsumptionProfile = mongoose.model("ConsumptionProfile",ConsumptionProfileSchema);
module.exports = ConsumptionProfile;