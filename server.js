import express from "express";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";


import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

// __dirname fix (ES module ke liye)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ||5001;

// React build serve karna
app.use(express.static(path.join(__dirname, "build")));


// React routing handle
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});