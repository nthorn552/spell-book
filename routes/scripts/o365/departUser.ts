import { Request, Response, NextFunction } from "express";
import Shell from "node-powershell";

const departUser = function(req: Request, res: Response, next: NextFunction) {
  const adminUsername: string = req.body.adminUsername;
  const adminPassword: string = req.body.adminPassword;
  const targetUsername: string = req.body.targetUsername;
  const newPassword: string = req.body.newPassword;
  const shouldLockAccount: string = req.body.shouldLockAccount ? "1" : null;

  // const scriptPath =
  //   "C:\\Users\\nate\\Projects\\spell-book\\scripts\\Simple-Test.ps1";
  const scriptPath =
    "C:\\Users\\nate\\Projects\\spell-book\\scripts\\O365-User-Departure-Procedure.ps1";

  // -AdminUsername test -AdminPassword test -Username test -NewPassword test

  //   const child = spawn("powershell.exe", [scriptPath]);
  //   child.stdout.on("data", function(data) {
  //     console.log("Powershell Data: " + data);
  //     res.json({ result: "success", data });
  //   });
  //   child.stderr.on("data", function(data) {
  //     console.log("Powershell Errors: " + data);
  //     res.json({ result: "error", data });
  //   });
  //   child.on("exit", function() {
  //     console.log("Powershell Script finished");
  //   });
  //   child.stdin.end();
  // };

  const ps = new Shell({
    executionPolicy: "Unrestricted",
    noProfile: true
  });

  ps.addCommand(scriptPath, [
    { adminUsername },
    { adminPassword },
    { targetUsername },
    { newPassword },
    { shouldLockAccount }
  ]);
  ps.invoke()
    .then(output => {
      res.send(output);
    })
    .catch(error => {
      res.send({ message: error.message });
    });
};

export default departUser;
