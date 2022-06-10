import { Shooting } from "./Schema.js";
import "dotenv/config";
const uri = process.env.MONGOOSE_URI;
import mongoose from "mongoose";
import fetch from "node-fetch";

async function fetcher() {
  const api = await fetch("https://polisen.se/api/events");
  const res = await api.json();
  await mongoose.connect(uri);
  const shootings = res.filter((elem) => {
    return (
      elem.type === "Skottlossning" || elem.type === "Skottlossning, misstänkt"
    );
  });

  const obj = shootings.map(({ datetime, location, id }) => {
    return {
      _id: id,
      date: new Date(datetime),
      location: { stad: location.name, location: toGPS(location.gps) },
    };
  });
  //   console.log(obj.location);
  //   console.log(obj[0].location);
  function toGPS(gps) {
    return gps.split(",").map((elem) => parseFloat(elem));
  }
  const allShootings = await Shooting.find({});
  //   console.log(JSON.stringify(obj[0]));
  //   console.log(allShootings);
  const all = await Shooting.find();
  console.log(all);
  obj.map(async (elem) => {
    console.log(elem);
    if (!(await Shooting.exists({ _id: elem._id }))) {
      await Shooting.create(elem);
    }
  });
}
fetcher();
