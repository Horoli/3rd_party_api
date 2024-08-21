const { NinjaAPI } = require("poe-api-manager");

class PoeNinja {
  constructor() {}

  static async get() {
    const ninja = new NinjaAPI("Settlers");

    await ninja.currencyView.currency.getQuickCurrency().then((data) => {
      console.log(data);
    });
  }
}

module.exports = PoeNinja;

//   static getInstance() {
//     if (!PoeNinja.instance) {
//       PoeNinja.instance = new PoeNinja();
//     }
//     return PoeNinja.instance;
//   }
// const ninjaApi = new NinjaAPI("Settlers")
