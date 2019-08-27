import express from "express";

import rootRouter from "./routes";
import config from "./config";

const app = express();

app.use("/", rootRouter);

app.listen(config.port, function() {
  console.log("Production Express server running at localhost:" + config.port);
});
