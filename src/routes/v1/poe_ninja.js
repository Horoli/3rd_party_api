const PoeNinja = require("@Utility/poe_ninja");
const Axios = require("axios");
// const { NinjaAPI } = require("poe-api-manager");
module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      // const asd = await PoeNinja.get("Settlers");

      // const zxc = await Axios.post("http://172.16.0.6:7100/image", {
      //   url: "aa",
      // });

      const result = await Axios({
        method: "post",
        url: "http://172.16.0.6:7100/image",
        data: {
          url: "https://web.poecdn.com/gen/image/WzI4LDE0LHsiZiI6IjJESXRlbXMvTWFwcy9BdGxhczJNYXBzL05ldy9VYmVyTWFsZm9ybWF0aW9uIiwidyI6MSwiaCI6MSwic2NhbGUiOjEsIm1uIjoyMSwibXQiOjE3LCJtZCI6dHJ1ZX1d/89b5c5eec9/UberMalformation.png",
        },
        responseType: "arraybuffer",
      });
      console.log(result);

      rep.type("image/png").send(result.data);

      // return {
      //   data: result.data,
      // };
    },
  },
};
