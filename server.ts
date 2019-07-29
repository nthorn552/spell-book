import express, { Request, Response } from "express";
import path from "path";
import { Entity } from "./schemas/entity";
const app = express();

const fs = require("fs");
let backupifyBlob = JSON.parse(
  fs.readFileSync("./assets/dattoStrip.json", "utf-8")
);

type BackupifySite = {
  name: string;
  usedBytes: string;
  status: string;
  latestSnap: string;
};

type SummaryNode = {
  bytesHere?: number;
  childrenTotalBytes?: number;
  children: SummaryMap;
};

type SummaryMap = Record<string, SummaryNode>;

function byteStringToInteger(byteString: string): number {
  const stringSplit = byteString.split(" ");
  let byteNum = parseFloat(stringSplit[0]);
  switch (stringSplit[1]) {
    case "kB":
      byteNum = byteNum * 10e2;
      break;
    case "MB":
      byteNum = byteNum * 10e5;
      break;
    case "GB":
      byteNum = byteNum * 10e8;
      break;
  }
  return Math.round(byteNum);
}

function totalDataCount(node: SummaryNode): number {
  node.childrenTotalBytes = 0;
  for (let nodePath in node.children) {
    let childSummaryNode = node.children[nodePath];
    node.childrenTotalBytes += totalDataCount(childSummaryNode);
  }
  return node.childrenTotalBytes + (node.bytesHere || 0);
}

app.get("/backupify", (req, res) => {
  let siteCount = 0;
  const dataReport: SummaryMap = { root: { children: {} } };

  // Digest each site data point
  backupifyBlob.data.forEach((site: BackupifySite) => {
    siteCount++;
    const pathList = site.name.trimLeft().split("/");
    let thisNode: SummaryNode = dataReport.root;

    pathList.forEach((path: string) => {
      if (path != "") {
        if (!thisNode.children[path]) {
          thisNode.children[path] = { children: {} };
        }
        thisNode = thisNode.children[path];
      }
    });

    thisNode.bytesHere = byteStringToInteger(site.usedBytes);
  });

  // Roll up child sizes to parents and report
  console.log("Total Data: " + totalDataCount(dataReport.root) / 10e8 + "GB");
  console.log("Site Count: " + siteCount);
  res.json(dataReport);
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, function() {
  console.log("Production Express server running at localhost:" + PORT);
});
