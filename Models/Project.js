const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");


const ProjectSchema = new Schema ({
    consumption: {
        type: String,
        required: true,
    },
    consumption_period: {
        type: String,
        required: true,
    },
    projectscol: {
        type: String,
        required: true,
    },
    cosine_factor: {
        type: String,
        required: true,
    },
    export_limit: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: true,
    },
    address_id: {
        type: Schema.Types.ObjectId,
        ref: "Address",
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
    },

    consumption_profiles_id: {
        type: Schema.Types.ObjectId,
        ref: "ConsumptionProfile",
    }


},
{timestamps: true}
);

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;




















