const fs = require("fs");

module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const { tags, attribute } = req.query;

      const selectedTags = JSON.parse(tags);
      const json = fs.readFileSync("./skill_gem.json");
      const jsonData = JSON.parse(json);

      const getSkillGems = jsonData.filter((data) => {
        // Aura, Mark, Guard, Movement 제외
        if (
          data.class !== "Skill Gem" ||
          data["gem tags"].includes("Aura") ||
          data["gem tags"].includes("Mark") ||
          data["gem tags"].includes("Guard") ||
          data["gem tags"].includes("Movement") ||
          data["gem tags"].includes("Warcry")
        ) {
          return false;
        }
        // 선택된 태그를 가진 데이터를 제거(선택된 태그가 없으면 모든 데이터 반환)
        for (let tag of selectedTags) {
          if (data["gem tags"].includes(tag)) {
            return false;
          }
        }
        // if (selectedTags.length !== 0) {
        //   if (!selectedTags.some((tag) => data["gem tags"].includes(tag))) {
        //     return false;
        //   }
        // }

        if (
          data["name"].includes(" of ") ||
          data["name"].includes("Vaal") ||
          data["name"].includes("subst")
        ) {
          return false;
        }

        if (!!attribute) {
          if (data["primary attribute"] !== attribute) {
            return false;
          }
        }

        return true;
      });

      return {
        statusCode: 200,
        length: getSkillGems.length,
        data: getSkillGems,
      };
    },
  },
};
