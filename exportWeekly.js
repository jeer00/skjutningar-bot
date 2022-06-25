import { Shooting } from "./Schema.js";
import { TwitterApi } from "twitter-api-v2";
import moment from "moment";
import "dotenv/config";
import fs from "fs";
const uri = process.env.MONGOOSE_URI;

import mongoose from "mongoose";
import fetch from "node-fetch";

await mongoose.connect(uri);

const allShootings = await Shooting.find()
  .lean()
  .exec((err, doc) => {
    const json = doc.map((elem) => {
      const date = new Date(elem.date);
      const res = [];
      // console.log(isWeekly(date));
      if (isWeekly(date)) {
        res.push(
          elem.date,
          elem.location.location[0],
          elem.location.location[1]
        );
        return res;
      }
    });
    const newFilter = json.filter((elem) => !!elem);
    console.log(newFilter);
    fs.writeFileSync("shootings.json", JSON.stringify(newFilter));
    return json;
  });

// console.log(allShootings);

function isWeekly(date) {
  // console.log(date);
  const weekDates = [];

  for (const i = 1; i <= 7; i++) {
    weekDates.push(moment().day(i).toDate().toJSON().split("T")[0]);
  }

  const isinWeek = weekDates.filter(
    (elem) => elem === date.toJSON().split("T")[0]
  );

  if (isinWeek.length) {
    return true;
  }
  return false;
}
