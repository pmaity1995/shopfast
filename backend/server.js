const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const client = redis.createClient({
    url: process.env.REDIS_URI
});

client.connect()
.then(() => console.log("Redis Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Backend API Running");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});