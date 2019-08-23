const dotenv = require("dotenv");
dotenv.config();

export default {
  port: process.env.PORT,
  rmm: {
    host: process.env.RMM_HOST,
    apiUsername: process.env.RMM_API_USERNAME,
    apiPassword: process.env.RMM_API_PASSWORD
  }
};
