require("better-module-alias")(__dirname);
const WebServer = require("./src");

const server = new WebServer({
  host: "0.0.0.0",
  port: 2017,
});

server.start();
