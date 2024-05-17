const path = require("path");

class FilePath {
  static getAssetJsonPath(filename) {
    const getPath = path.resolve(
      __dirname,
      "..",
      "src",
      "assets",
      "json",
      `${filename}`
    );
    return getPath;
  }

  static get skillGemJson() {
    return this.getAssetJsonPath("skill_gem.json");
  }

  static get skillGemInfoJson() {
    return this.getAssetJsonPath("skill_gem_info.json");
  }

  static get skillGemIconJson() {
    return this.getAssetJsonPath("skill_gem_icon.json");
  }
}

module.exports = FilePath;
