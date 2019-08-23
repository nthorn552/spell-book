import express, { Request, Response } from "express";
import axios from "axios";
const router = express.Router();

type DuplicateRequest = Request & {
  params: {
    site?: string;
  };
};

router.get("/duplicates", (req: DuplicateRequest, res) => {
  let result = "no result";

  axios
    .get("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY")
    .then(response => {
      console.log(response.data.url);
      console.log(response.data.explanation);
    })
    .catch(error => {
      console.log(error);
    });

  axios
    .get("https://zinfandel-api.centrastage.net/api/v2/account/devices")
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });

  console.log(result);
  //   res.json({ test: "result" });
});

export default router;
