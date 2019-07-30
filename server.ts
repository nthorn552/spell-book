import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import { Entity } from "./schemas/entity";

import rootRouter from "./routes";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use("/", rootRouter);

const PORT = process.env.PORT || 8082;
app.listen(PORT, function() {
  console.log("Production Express server running at localhost:" + PORT);
});
