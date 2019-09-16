import express from "express";
const router = express.Router();

// const departUser = require("./departUser.js");
import departUser from "./departUser.js";

router.post("/departUser", departUser);

export default router;
