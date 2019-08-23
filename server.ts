import express from "express";
import { Entity } from "./schemas/entity";

import rootRouter from "./routes";

const app = express();

app.use("/", rootRouter);

const PORT = process.env.PORT || 8082;
app.listen(PORT, function() {
  console.log("Production Express server running at localhost:" + PORT);
});
