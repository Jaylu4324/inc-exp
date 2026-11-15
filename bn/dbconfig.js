require("dotenv").config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/income_expense";

mongoose.connect(MONGO_URI)
.then((data) => {
    console.log(`Database connected successfully to ${MONGO_URI}`);
})
.catch((err) => {
    console.error("Database connection error:", err);
});
