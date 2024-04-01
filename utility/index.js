const Crypto = require("crypto");
const bcrypt = require("bcryptjs");

class Utility {
  static UUID(hypenless = false) {
    let uuid = Crypto.randomUUID();
    if (hypenless) uuid = uuid.replace(/-/g, "");
    return uuid;
  }

  static async hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  static async comparePassword(firstPassword, secondPassword) {
    return bcrypt.compareSync(firstPassword, secondPassword);
  }
}

module.exports = Utility;
