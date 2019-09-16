import express from "express";
import bodyParser from "body-parser";
const router = express.Router();

import reports from "./reports";
import scripts from "./scripts";

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
router.use(bodyParser.json());

router.use("/reports", reports);
router.use("/scripts", scripts);

export default router;
