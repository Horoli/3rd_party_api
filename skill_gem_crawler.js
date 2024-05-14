const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

class SkillGem {
  constructor() {
    this.baseUrl = "https://www.poewiki.net";
    this.wikiUrl = "https://www.poewiki.net/wiki";
    this.skillGemJson = JSON.parse(fs.readFileSync("./skill_gem.json"));
    this.urlJson = [];
  }

  async #getJson(index) {
    const imageFile = this.skillGemJson[index]["inventory icon"].replace(
      / /g,
      "_"
    );

    await axios.get(`${this.wikiUrl}/${imageFile}`).then(async (response) => {
      const html = response.data;
      const cheer = cheerio.load(html);

      const imgSrc = cheer("div.fullImageLink > a").attr("href");

      const data = {
        name: this.skillGemJson[index].name,
        imageUrl: `${this.baseUrl}${imgSrc}`,
      };

      console.log(index, data.imageUrl);
      const getImageResult = await this.#getImage(data.imageUrl);

      data.base64Image = getImageResult;

      this.urlJson.push(data);

      // console.log(this.urlJson);
    });
  }

  async #getImage(imageUrl) {
    const getBase64Image = await axios
      .get(imageUrl, { responseType: "arraybuffer" })
      .then((response) => {
        const img = Buffer.from(response.data, "binary").toString("base64");

        return img;
      });
    return getBase64Image;
  }

  async getImageUrl() {
    let index = 0;

    const interval = this.setInterval(async () => {
      if (index === this.skillGemJson.length) {
        console.log(`${index} clear`);

        fs.writeFileSync(`./skill_gem_url.json`, JSON.stringify(this.urlJson));
        clearInterval(interval);
        return;
      }
      this.#getJson(index);
      index++;
    }, 1000);
  }

  setInterval(callback, interval) {
    callback();
    return setInterval(callback, interval);
  }
}

// module.exports = SkillGem;

const skillGem = new SkillGem();
skillGem.getImageUrl();
