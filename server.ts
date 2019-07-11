import express, { Request, Response } from "express";
import path from "path";
const app = express();

import apiRouter from "./routes/index";

// serve our static stuff
app.use(express.static(path.join(__dirname, "dist")));

app.all("/api", apiRouter);

// send all requests to index.html so browserHistory in React Router works
app.get("*", function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

var PORT = process.env.PORT || 8081;
app.listen(PORT, function() {
  console.log("Production Express server running at localhost:" + PORT);
});
