import express, { Request, Response } from "express";
const router = express.Router();

import fs from "fs";

type BackupifySite = {
  name: string;
  usedBytes: string;
  status: string;
  latestSnap: string;
};

type SummaryNode = {
  bytesHere?: number;
  childrenTotalBytes?: number;
  totalBytes?: number;
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
  node.totalBytes = node.childrenTotalBytes + (node.bytesHere || 0);
  return node.totalBytes;
}

type BackupifyRequest = Request & {
  params: {
    subList?: [string];
  };
};

router.get("/backupify", (req: BackupifyRequest, res) => {
  let rawData = JSON.parse(
    fs.readFileSync("./assets/dattoStrip.json", "utf-8")
  );

  const pathsToInclude = ["/18 1662 V3", "/bd", "/kc", "/tm", "/ws"]; // should be moved to request params

  let siteCount = 0;
  const dataReport: SummaryMap = { root: { children: {} } };

  // Digest each site data point
  rawData.data.forEach((site: BackupifySite) => {
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

  // Special Report
  let specificationSize = 0;
  if (pathsToInclude) {
    console.log(pathsToInclude);
    pathsToInclude.forEach((path: string) => {
      const pathList = path.trimLeft().split("/");

      let thisNode: SummaryNode = dataReport.root;
      pathList.forEach((path: string) => {
        if (path != "") {
          if (thisNode.children[path]) {
            thisNode = thisNode.children[path];
          }
        }
      });

      specificationSize += thisNode.bytesHere + thisNode.childrenTotalBytes;
    });
    console.log("Subset Total Bytes: " + specificationSize);
  }

  res.json(dataReport);
});

export default router;
