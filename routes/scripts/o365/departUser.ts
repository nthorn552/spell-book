import { Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import Shell from "node-powershell";

const departUser = function(req: Request, res: Response, next: NextFunction) {
  const scriptPath =
    "C:\\Users\\nate\\Projects\\spell-book\\scripts\\O365-User-Departure-Procedure.ps1 -AdminUsername test -AdminPassword test -Username test -NewPassword test";
  const child = spawn("powershell.exe", [scriptPath]);
  child.stdout.on("data", function(data) {
    console.log("Powershell Data: " + data);
    res.json({ result: "success", data });
  });
  child.stderr.on("data", function(data) {
    console.log("Powershell Errors: " + data);
    res.json({ result: "error", data });
  });
  child.on("exit", function() {
    console.log("Powershell Script finished");
  });
  child.stdin.end();
};

// app.get("/user/:DisplayName", function (request, response) {
//   ps.addCommand('./scripts/demo.ps1', [{
//     name: "DisplayName",
//     value: request.params.DisplayName
//   }])
//   ps.invoke().then(output => {
//     response.send(output)
//   })
// })

export default departUser;
