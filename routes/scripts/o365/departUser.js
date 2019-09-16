import Shell from "node-powershell";

const departUser = function(req, res, next) {
  const ps = new Shell({
    executionPolicy: "Bypass",
    noProfile: true
  });

  ps.addCommand("Write-Host node-powershell")
    .then(() => ps.addParameter({ foregroundcolor: "red" }))
    .then(() => ps.invoke())
    .then(output => {
      res.json("success");
    })
    .catch(error => {
      res.json(error);
    });
};

module.exports = departUser;
