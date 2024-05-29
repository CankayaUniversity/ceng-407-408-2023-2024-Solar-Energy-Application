const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");


const ProjectSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
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
    },
    solarpanel_id: {
        type: Schema.Types.ObjectId,
        ref: "SolarPanel",
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }

},
{timestamps: true}
);

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;




















