const { NinjaAPI } = require("poe-api-manager");

class PoeNinja {
  constructor() {}
  static ninja = new NinjaAPI("Settlers");
  static #standardChaosValue = 50;
  static #currencyFilter = ["id", "name", "icon", "chaosEquivalent"];
  static #itemFilter = ["name", "icon", "chaosValue"];
  static #mapFilter = ["name", "icon", "chaosValue", "mapTier"];

  static async get() {
    const getCurrency = await this.#getCurrency();
    const getFragment = await this.#getFragment();
    const getScarab = await this.#getScarab();
    const getInvitation = await this.#getInvitation();
    const getMaps = await this.#getMaps();

    return {
      currency: getCurrency,
      fragment: getFragment,
      scarab: getScarab,
      invitation: getInvitation,
      map: getMaps,
    };
  }

  static async #getCurrency() {
    const getCurrency = await this.ninja.currencyView.currency
      .getData(this.#currencyFilter)
      .then((data) => {
        return data;
      });

    return getCurrency.filter((currency) => {
      return currency.chaosEquivalent > this.#standardChaosValue;
    });
  }
  static async #getFragment() {
    const getFragment = await this.ninja.currencyView.fragment
      .getData(this.#currencyFilter)
      .then((data) => {
        return data;
      });

    return getFragment.filter((fragment) => {
      return fragment.chaosEquivalent > this.#standardChaosValue;
    });
  }
  static async #getScarab() {
    const getScarabs = await this.ninja.itemView.scarab
      .getData(this.#itemFilter)
      .then((data) => {
        return data;
      });

    return getScarabs.filter((scarab) => {
      return scarab.chaosValue > this.#standardChaosValue;
    });
  }

  static async #getInvitation() {
    const getInvitation = await this.ninja.itemView.invitation
      .getData(this.#itemFilter)
      .then((data) => {
        return data;
      });

    return getInvitation.filter((invitation) => {
      return invitation.chaosValue > this.#standardChaosValue;
    });
  }

  static async #getMaps() {
    const maps = await this.ninja.itemView.map
      .getData(this.#mapFilter)
      .then((data) => {
        return data;
      });

    return maps.filter((map) => {
      return map.mapTier === 17;
    });
  }
}

module.exports = PoeNinja;
