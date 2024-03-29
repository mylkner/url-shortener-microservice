require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const ShortUniqueId = require("short-unique-id");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

const db = {}; //temporary database

app.post("/api/shorturl", (req, res) => {
    const url = JSON.stringify(req.body.url.replace("https://", "")).slice(
        1,
        -1
    );
    const uid = new ShortUniqueId().rnd();

    dns.lookup(url, (err) => {
        if (err) {
            return res.json({ error: "invalid url" });
        }

        db[url] ? db[url] : (db[url] = uid);

        return res.json({
            original_url: "https://" + url,
            short_url: db[url],
        });
    });
});

app.get("/api/shorturl/:short", (req, res) => {
    if (Object.values(db).includes(req.params.short)) {
        res.redirect(
            "https://" +
                Object.keys(db).find((url) => db[url] === req.params.short)
        );
    } else {
        res.send({ error: "short url not found" });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
