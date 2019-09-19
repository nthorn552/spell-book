import { Request, Response, NextFunction } from "express";
import Shell from "node-powershell";

const runScript = function(
  scriptPath: string,
  paramArray: { [key: string]: string }[]
): Promise<string> {
  const ps = new Shell({
    executionPolicy: "Unrestricted",
    noProfile: true
  });

  ps.addCommand(scriptPath, paramArray);
  return ps.invoke();
};

const departUser = function(req: Request, res: Response, next: NextFunction) {
  const adminUsername: string = req.body.adminUsername;
  const adminPassword: string = req.body.adminPassword;
  const targetUsername: string = req.body.targetUsername;
  const newPassword: string = req.body.newPassword;
  if (!adminUsername || !adminPassword || !targetUsername || !newPassword) {
    res.status(400);
    res.send({ message: "Missing required fields" });
    return;
  }
  // const shouldLockAccount: string = req.body.shouldLockAccount ? "" : "0";
  const scriptParams: { [key: string]: string }[] = [
    { adminUsername },
    { adminPassword },
    { newPassword },
    { targetUsername }
  ];
  if (req.body.shouldLockAccount) {
    scriptParams.push({ shouldLockAccount: "" });
  }
  //TODO: req.body.timeToExecute
  const scriptPath =
    "C:\\Users\\nate\\Projects\\spell-book\\scripts\\O365-User-Departure-Procedure.ps1"; //TODO: move to dist

  runScript(scriptPath, scriptParams)
    .then(output => {
      console.log(output);
      res.send({ result: "success", data: output });
    })
    .catch(error => {
      res.status(500);
      res.send({ result: "error", code: error });
    });
};

export default departUser;
