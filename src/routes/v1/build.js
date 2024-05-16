const GeneralResponse = require("@Utility/general_response");
const path = require("path");
const fs = require("fs");

module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const { tags, attribute } = req.query;

      const selectedTags = JSON.parse(tags);

      // const filePath = path.join("")

      const skillGem = path.resolve(
        __dirname,
        "..",
        "..",
        "assets",
        "json",
        "skill_gem.json"
      );
      const json = fs.readFileSync(skillGem);
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
          data["name"].includes("subst") ||
          data["name"].includes("Portal") ||
          data["name"].includes("Blood and Sand")
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

      return new GeneralResponse({
        statusCode: 200,
        length: getSkillGems.length,
        data: getSkillGems,
      });
    },
  },
  "GET /image": {
    middlewares: [],
    async handler(req, rep) {
      const { name } = req.query;

      // console.log(__dirname);

      const iconPath = path.resolve(
        __dirname,
        "..",
        "..",
        "assets",
        "json",
        "skill_gem_icon.json"
      );

      const infoPath = path.resolve(
        __dirname,
        "..",
        "..",
        "assets",
        "json",
        "skill_gem_info.json"
      );
      const skillGemIcons = fs.readFileSync(iconPath);
      const skillGemInfos = fs.readFileSync(infoPath);
      const jsonSkillGemIcons = JSON.parse(skillGemIcons);
      const jsonSkillGemInfos = JSON.parse(skillGemInfos);

      const getSkillGemImage = jsonSkillGemIcons.filter((e) => e.name === name);
      const getSkillGemInfo = jsonSkillGemInfos.filter((e) => e.name === name);
      console.log(getSkillGemInfo[0]);

      const returnValue = {
        ...getSkillGemInfo[0],
        ...getSkillGemImage[0],
      };

      return new GeneralResponse({
        statusCode: 200,
        message: "get skill gem image",
        data: returnValue,
      });
    },
  },
};
