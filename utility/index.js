const Crypto = require("crypto");

class Utility {
  static UUID(hypenless = false) {
    let uuid = Crypto.randomUUID();
    if (hypenless) uuid = uuid.replace(/-/g, "");
    return uuid;
  }
}

module.exports = Utility;
