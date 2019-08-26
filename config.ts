const dotenv = require("dotenv");
dotenv.config();

export default {
  port: process.env.PORT,
  rmm: {
    apiRootUrl: process.env.RMM_API_URL,
    apiUsername: process.env.RMM_API_USERNAME,
    apiPassword: process.env.RMM_API_PASSWORD,
    apiToken: process.env.RMM_API_TOKEN
  }
};
