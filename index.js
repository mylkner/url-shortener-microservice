require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
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

const db = []; //temporary  for tests

app.post("/api/shorturl", (req, res) => {
    const url = JSON.stringify(req.body.url.replace("https://", "")).slice(
        1,
        -1
    );

    dns.lookup(url, (err) => {
        if (err) {
            return res.json({ error: "invalid url" });
        }

        db.includes(url) ? db : db.push(url);

        return res.json({
            original_url: "https://" + url,
            short_url: db.indexOf(url) + 1,
        });
    });
});

app.get("/api/shorturl/:short", (req, res) => {
    if (db.length >= req.params.short && req.params.short > 0) {
        res.redirect("https://" + db[req.params.short - 1]);
    } else {
        res.send({ error: "short url not found" });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
