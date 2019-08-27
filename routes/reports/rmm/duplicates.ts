import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse } from "axios";
import config from "../../../config";

axios.defaults.headers.common["Authorization"] = config.rmm.apiToken;

type DuplicateRequest = Request & {
  params: {
    site?: string;
  };
};

type Device = {
  id: string;
  uid: string;
  hostname: string;
  creationDate: 0;
  deleted: boolean;
  description: string;
  deviceClass: "device";
  intIpAddress: string;
  lastLoggedInUser: string;
  online: boolean;
  operatingSystem: string;
  siteName: string;
  siteUid: string;
  anitvirus?: {};
  patchManagement?: {};
  udf?: {};
};

type DeviceResponseData = {
  pageDetails: {
    nextPageUrl: string;
  };
  devices: Device[];
};

async function getDuplicates(
  req: DuplicateRequest,
  res: Response,
  next: NextFunction
) {
  const totalDeviceList = await fetchAllDevices();
  const duplicateList = findDuplicateDevices(totalDeviceList);
  res.json({
    devices: duplicateList,
    summary: createSummaryFromDuplicateList(duplicateList),
    count: duplicateList.length
  });
}

async function fetchAllDevices(): Promise<Device[]> {
  const rawDeviceList: Device[] = [];
  let nextPageUrl = config.rmm.apiRootUrl + "/v2/account/devices";
  while (nextPageUrl) {
    console.info("Fetching page from RMM:" + nextPageUrl);
    let response: AxiosResponse<DeviceResponseData> = await axios.get(
      nextPageUrl
    );
    nextPageUrl = response.data.pageDetails.nextPageUrl;
    rawDeviceList.push(...response.data.devices);
  }
  return rawDeviceList;
}

function findDuplicateDevices(deviceList: Device[]): [Device[]?] {
  // Separate devices by combined key of Hostname and Site UID
  const uniqueDeviceMap: Map<string, Device[]> = new Map<string, Device[]>();
  deviceList
    .filter(device => !device.deleted)
    .forEach(device => {
      let identifier = device.hostname + device.siteUid;
      if (!uniqueDeviceMap.get(identifier)) {
        uniqueDeviceMap.set(identifier, []);
      }
      delete device.patchManagement;
      delete device.udf;
      uniqueDeviceMap.get(identifier).push(device);
    });
  // Find all cases where number of matching devices is >1
  const duplicates: [Device[]?] = [];
  uniqueDeviceMap.forEach(matchingDevices => {
    if (matchingDevices.length > 1) {
      duplicates.push(matchingDevices.slice());
    }
  });
  return duplicates;
}

function createSummaryFromDuplicateList(
  duplicateList: [Device[]?]
): Record<string, string[]> {
  const summaryList: Record<string, string[]> = {};
  duplicateList.forEach(deviceList => {
    let device = deviceList[0];
    if (!summaryList[device.siteName]) {
      summaryList[device.siteName] = [];
    }
    summaryList[device.siteName].push(device.hostname);
  });
  return summaryList;
}

export default getDuplicates;
