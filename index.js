require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");
const mongoose = require("mongoose");
const Urls = require("./Schemas/Url.js");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const createAndSaveUrl = async (url) => {
    try {
        const urlData = await Urls.create({
            url: url,
        });
        return urlData;
    } catch (err) {
        console.log(err.message);
    }
};

app.use(cors());

app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
    try {
        const url = req.body.url;

        dns.lookup(new URL(url).hostname, async (err) => {
            if (err) {
                return res.json({ error: "invalid url" });
            }

            const urlData =
                (await Urls.findOne({ url: url })) ||
                (await createAndSaveUrl(url));

            return res.json({
                original_url: urlData.url,
                short_url: urlData.urlShortened,
            });
        });
    } catch (err) {
        res.json({ error: "invalid url" });
    }
});

app.get("/api/shorturl/:short", async (req, res) => {
    const url = await Urls.findOne({ urlShortened: req.params.short });

    if (url) {
        res.redirect(url.url);
    } else {
        res.json({ error: "invalid short url" });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
