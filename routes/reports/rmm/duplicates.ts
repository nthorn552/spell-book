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
  const hostnameList: string[] = [];
  let duplicateCount = 0;
  duplicateList.forEach(device => {
    duplicateCount++;
    hostnameList.push(device.hostname);
  });
  res.json({
    devices: duplicateList,
    summary: hostnameList,
    count: duplicateCount
  });
}

async function fetchAllDevices(): Promise<Device[]> {
  const rawDeviceList: Device[] = [];
  let nextPageUrl = config.rmm.apiRootUrl + "/v2/account/devices";
  console.log(nextPageUrl);
  while (nextPageUrl) {
    let response: AxiosResponse<DeviceResponseData> = await axios.get(
      nextPageUrl
    );
    nextPageUrl = response.data.pageDetails.nextPageUrl;
    rawDeviceList.push(...response.data.devices);
    console.log(nextPageUrl);
  }
  return rawDeviceList;
}

function findDuplicateDevices(deviceList: Device[]) {
  const duplicates: Device[] = [];
  const deviceMap: Record<string, number> = {};
  deviceList
    .filter(device => !device.deleted)
    .forEach(device => {
      if (deviceMap[device.hostname]) {
        // TODO: update to check that hostname unique at site only
        deviceMap[device.hostname]++;
        device;
        duplicates.push(device);
      } else {
        deviceMap[device.hostname] = 1;
      }
    });
  return duplicates;
}

export default getDuplicates;
