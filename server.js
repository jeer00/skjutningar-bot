import mongoose from "mongoose";
import "dotenv/config";
const uri = process.env.MONGOOSE_URI;
import express from "express";

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  return res.json({ message: "Hello, World ✌️" });
});

const start = async () => {
  try {
    app.listen(3000, () => console.log("Server started on port 3000"));
    await mongoose.connect(uri).then(console.log("mongoose startad"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
