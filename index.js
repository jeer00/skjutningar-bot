import { Shooting } from "./Schema.js";
import { TwitterApi } from "twitter-api-v2";
import "dotenv/config";
import fs from "fs";
import Axios from "axios";
const uri = process.env.MONGOOSE_URI;

import mongoose from "mongoose";
import fetch from "node-fetch";
const userClient = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});
await mongoose.connect(uri);
async function fetcher() {
  setInterval(async () => {
    const api = await fetch("https://polisen.se/api/events");
    const res = await api.json();
    console.log(res);
    const shootings = res.filter((elem) => {
      return (
        elem.type === "Skottlossning" ||
        elem.type === "Skottlossning, misstänkt"
      );
    });

    const allShootings = await Shooting.find({});

    const cleanShootings = shootings.filter(({ id }) => {
      return !allShootings.find(({ _id }) => {
        return id === _id;
      });
    });
    const obj = cleanShootings.map(({ datetime, location, id, type }) => {
      return {
        type,
        _id: id,
        date: new Date(datetime),
        location: { name: location.name, location: toGPS(location.gps) },
      };
    });
    function toGPS(gps) {
      return gps.split(",").map((elem) => parseFloat(elem));
    }

    if (obj.length) {
      obj.map((elem) => {
        Shooting.create(elem);
        console.log(elem);
        postTweet(elem);
      });
    }
  }, 2000);
}

async function postTweet(elem) {
  const image = `https://maps.googleapis.com/maps/api/staticmap?center=${elem.location.location[0]},${elem.location.location[1]}&zoom=6&size=400x400&markers=${elem.location.location[0]},${elem.location.location[1]}&key=${process.env.MAPS_API_KEY}`;
  console.log(image);
  async function downloadImage() {
    const response = await Axios({
      url: image,
      method: "GET",
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(`${elem._id}.png`))
        .on("error", reject)
        .once("close", () => resolve(`${elem._id}.png`));
    });
  }
  await downloadImage(image);

  const mediaId = await userClient.v1.uploadMedia(`${elem._id}.png`);

  const { data: createdTweet } = await userClient.v2.tweet({
    text: `Flash: ${
      elem.type === "Skottlossning, misstänkt" ? "misstänkt" : ""
    } Skjutning i: ${elem.location.name}`,
    media: { media_ids: [mediaId] },
  });
}

fetcher();
