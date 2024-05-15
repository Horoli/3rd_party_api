const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const Utility = require(".");

class SkillGem {
  constructor() {
    this.poeWikiBaseUrl = "https://www.poewiki.net";
    this.poeWikiUrl = "https://www.poewiki.net/wiki";
    this.poeDBUrl = "https://poedb.tw/kr";
    this.skillGemJson = JSON.parse(fs.readFileSync("./skill_gem.json"));
    this.skillGemIconsJson = [];
    this.skillGemInfoJson = [];
  }

  /**
   * from poeWiki
   */
  async #getPoeWikiJson(index) {
    const path = this.skillGemJson[index]["inventory icon"].replace(/ /g, "_");

    await axios.get(`${this.poeWikiUrl}/${path}`).then(async (response) => {
      const html = response.data;
      const cheer = cheerio.load(html);

      const imgSrc = cheer("div.fullImageLink > a").attr("href");

      const data = {
        name: this.skillGemJson[index].name,
        imageUrl: `${this.poeWikiBaseUrl}${imgSrc}`,
      };

      console.log(index, data.imageUrl);
      const getImageResult = await this.#getBase64Image(data.imageUrl);

      data.base64Image = getImageResult;

      this.skillGemIconsJson.push(data);
    });
  }

  /**
   * from poeDB
   */
  async #getPoeDBJson(index) {
    let gemName = this.skillGemJson[index]["name"].replace(/ /g, "_");
    if (gemName === "Projection_Support") {
      return;
    }

    await axios.get(`${this.poeDBUrl}/${gemName}`).then(async (response) => {
      const html = response.data;
      const cheer = cheerio.load(html);

      const targetHtml = ".active .gemPopup .itemBoxContent .content .Stats";

      const properties = cheer(`${targetHtml} .property`);

      const lcText = cheer(".lc").html();
      const statsObject = {};
      properties.each((index, property) => {
        const getElementText = cheer(property).text();
        if (index == 0) {
          const splitTagText = getElementText.split(", ");
          statsObject["태그"] = splitTagText;
        }

        if (index != 0) {
          const splitText = getElementText.split(": ");
          statsObject[splitText[0]] = splitText[1];
        }
      });

      const requirementsText = cheer(`${targetHtml} .requirements`).text();
      const textGemText = cheer(`${targetHtml} .text-gem`).text();

      let explicitMods = cheer(`${targetHtml} .explicitMod`).html();
      if (explicitMods !== null) {
        explicitMods = explicitMods.split("<br>");
        explicitMods = explicitMods.map((mod) =>
          mod.replace(/<span class="mod-value">|<\/span>/g, "")
        );
      }

      const qualityHeaderText = "퀄리티로 인한 추가 효과";

      const qualityModText = cheer(`${targetHtml} .qualityMod`).text();

      const defaultText = cheer(".default").text().trim();
      //   const divText = cheer(".default").next().text();

      const gemInfoObject = {
        // name: gemName,
        name: this.skillGemJson[index]["name"],
        lcText: lcText,
        statsObject: statsObject,
        requirementsText: requirementsText,
        textGemText: textGemText,
        explicitMods: explicitMods,
        qualityHeaderText: qualityHeaderText,
        qualityModText: qualityModText,
        defaultText: defaultText,
      };

      this.skillGemInfoJson.push(gemInfoObject);

      console.log(index, gemInfoObject.name);
    });
  }

  async #getBase64Image(imageUrl) {
    const getBase64Image = await axios
      .get(imageUrl, { responseType: "arraybuffer" })
      .then((response) => {
        const img = Buffer.from(response.data, "binary").toString("base64");

        return img;
      });
    return getBase64Image;
  }

  /**
   * poeWiki에서 skillGemIcon을 가져와 base64로 저장
   * setInterval은 1초마다 작동
   */
  async getSkillGemIcons() {
    let index = 0;

    const interval = Utility.setInterval(async () => {
      if (index === this.skillGemJson.length) {
        console.log(`${index} clear`);

        fs.writeFileSync(
          `./skill_gem_icon.json`,
          JSON.stringify(this.skillGemIconsJson)
        );
        clearInterval(interval);
        return;
      }
      this.#getPoeWikiJson(index);
      index++;
    }, 1000);
  }

  /**
   * poeDB에서 skillGemInfo를 크롤링해서 저장
   * index = 171, 172 Convocation 데이터 2개
   * index = 333에 Hemorrhage Support를 Bloodlust_support인지 확인
   * index = 477에 Projection Support는 없는 값임
   * index = 672에 Vaal Lightning Trap 스킵됨
   */
  async getSkillGemInfos() {
    let index = 0;
    console.log(this.skillGemJson.length);

    const interval = Utility.setInterval(async () => {
      if (index === this.skillGemJson.length) {
        fs.writeFileSync(
          `./skill_gem_info.json`,
          JSON.stringify(this.skillGemInfoJson)
        );

        clearInterval(interval);
        return;
      }
      this.#getPoeDBJson(index);
      index++;
    }, 2000);
  }
}

module.exports = SkillGem;
