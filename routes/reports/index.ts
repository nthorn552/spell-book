import express from "express";
const router = express.Router();

// import backupify from "./backupify";
import rmm from "./rmm";

// router.use("/backupify", backupify);
router.use("/rmm", rmm);

export default router;
