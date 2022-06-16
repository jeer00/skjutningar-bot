import mongoose from "mongoose";
const { Schema } = mongoose;

const shooting = new Schema({
  _id: Number,
  date: Date,
  location: {
    name: String,
    location: [Number, Number],
  },
  img: String,
});

export const Shooting = mongoose.model("shooting", shooting);
