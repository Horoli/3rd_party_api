const fs = require("fs");

module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const json = fs.readFileSync("./skill_gem.json");
      const jsonData = JSON.parse(json);

      const getSkillGems = jsonData.filter(
        (data) =>
          data.class === "Skill Gem" && !data["gem tags"].includes("Aura")
        //   &&
        //   !data["gem tags"].includes("Spell")
      );

      return {
        statusCode: 200,
        length: getSkillGems.length,
        data: getSkillGems,
      };
    },
  },
};
