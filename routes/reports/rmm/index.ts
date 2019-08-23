import express, { Request, Response } from "express";
import axios from "axios";
const router = express.Router();

import config from "../../../config";
import getDuplicates from "./duplicates";

router.post("/auth", (req: Request, res: Response) => {
  console.log("auth start");

  axios
    .request({
      url: "/auth/oauth/token",
      method: "post",
      baseURL: config.rmm.host,
      auth: {
        username: "public-client",
        password: "public"
      },
      data: {
        grant_type: "authorization_code"
      }
    })
    .then(function(res) {
      console.log(res);
      console.log("auth complete");
    })
    .catch(function(error) {
      console.log(res);
      console.log("auth error");
    });
  res.json({ test: "complete" });
});
router.get("/duplicates", getDuplicates);

export default router;
