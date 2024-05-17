const fs = require("fs");
const path = require("path");

class FilePath {
  static jsonPath(file) {
    const getJsonPath = path.resolve(
      __dirname,
      "..",
      "src",
      "assets",
      "json",
      `${file}`
    );
    return getJsonPath;
  }

  static get skillGemJson() {
    return this.jsonPath("skill_gem.json");
  }

  static get skillGemInfoJson() {
    return this.jsonPath("skill_gem_info.json");
  }

  static get skillGemIconJson() {
    return this.jsonPath("skill_gem_icon.json");
  }
}

module.exports = FilePath;
