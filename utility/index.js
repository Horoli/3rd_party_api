const Crypto = require("crypto");
const bcrypt = require("bcryptjs");

class Utility {
  static UUID(hypenless = false) {
    let uuid = Crypto.randomUUID();
    if (hypenless) uuid = uuid.replace(/-/g, "");
    return uuid;
  }

  static getLocalTime(date) {
    const getDate = !date ? new Date() : new Date(date);
    const timezoneOffsetToMiliseconds = getDate.getTimezoneOffset() * 60 * 1000;
    return new Date(getDate.getTime() - timezoneOffsetToMiliseconds);
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
