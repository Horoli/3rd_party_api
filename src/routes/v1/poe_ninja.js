const PoeNinja = require("@Utility/poe_ninja");
// const { NinjaAPI } = require("poe-api-manager");
module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, res) {
      const asd = await PoeNinja.get("Settlers");
      return {
        data: asd,
      };
    },
  },
};
