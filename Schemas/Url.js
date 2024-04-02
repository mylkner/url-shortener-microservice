const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    urlShortened: {
        type: Number,
        unique: true,
    },
});

const counter = new mongoose.Schema({
    serial: { type: Number },
});

const Counter = mongoose.model("Counter", counter);

urlSchema.pre("save", async function (next) {
    const count =
        (await Counter.findOneAndUpdate(
            {},
            { $inc: { serial: 1 } },
            { new: true }
        )) || (await Counter.create({ serial: 1 }));
    this.urlShortened = count.serial;
    next();
});

module.exports = mongoose.model("Urls", urlSchema);
