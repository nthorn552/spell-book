import { Request, Response } from "express";
import axios from "axios";

type DuplicateRequest = Request & {
  params: {
    site?: string;
  };
};

function getDuplicates(req: DuplicateRequest, res: Response) {
  let result = "no result";
  axios
    .get("https://zinfandel-api.centrastage.net/api/v2/account/devices")
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });

  console.log(result);
  res.json({ test: "result" });
}

export default getDuplicates;
