import express from "express";
const router = express.Router();

import getDuplicates from "./duplicates";

router.get("/duplicates", getDuplicates);

export default router;
