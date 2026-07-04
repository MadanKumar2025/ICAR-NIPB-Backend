import express from "express";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
