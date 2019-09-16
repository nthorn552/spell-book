import express from "express";
const router = express.Router();

import o365 from "./o365";

router.use("/o365", o365);

export default router;
