const PoeNinja = require("@Utility/poe_ninja");
// const { NinjaAPI } = require("poe-api-manager");
module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, res) {
      // const ninjaAPI = new NinjaAPI("Settlers");

      // await ninjaAPI.currencyView.currency.getData().then((data) => {
      //   console.log(data);
      // });
      await PoeNinja.get();
    },
  },
};
