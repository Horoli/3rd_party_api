require("dotenv").config();
require("better-module-alias")(__dirname);
const WebServer = require("./src");

const server = new WebServer({
  host: process.env.SERVER_HOST || "0.0.0.0",
  port: parseInt(process.env.SERVER_PORT) || 2017,
});

server.start();
