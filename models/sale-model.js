const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    createdAt: { type: Date, default: Date.now },
    percentage: Number
});

module.exports = mongoose.model("Sale", saleSchema);
