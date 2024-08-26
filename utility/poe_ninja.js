const Axios = require("axios");
const { NinjaAPI } = require("poe-api-manager");

class PoeNinja {
  constructor() {}
  static ninjaApi = new NinjaAPI("Settlers");
  static #cache = {};
  static #standardChaosValue = 50;
  static #currencyFilter = ["id", "name", "icon", "chaosEquivalent"];
  static #itemFilter = ["name", "icon", "chaosValue"];
  static #mapFilter = ["name", "icon", "chaosValue", "mapTier"];

  static async getCache() {
    return this.#cache;
  }

  static async setCache() {
    console.log(`[${new Date().toLocaleString()}] Poe.ninja cache updating...`);

    const getCurrency = await this.#getCurrency();
    const getFragment = await this.#getFragment();
    const getScarab = await this.#getScarab();
    const getInvitation = await this.#getInvitation();
    const getMaps = await this.#getMaps();

    this.#cache = {
      date: new Date().toLocaleString(),
      currency: getCurrency,
      fragment: getFragment,
      scarab: getScarab,
      invitation: getInvitation,
      map: getMaps,
    };

    console.log(
      `[${new Date().toLocaleString()}] Poe.ninja cache update complete`
    );
  }

  static #postImage(filtered) {
    return filtered.map(async (data) => {
      const result = await Axios({
        method: "post",
        // url: "http://127.0.0.1:7100/image",
        url: "http://172.16.0.6:7100/image",
        headers: {
          "hash-only": "true",
        },
        data: {
          url: data.icon,
        },
      });
      return {
        ...data,
        icon: result.headers["image-hash"],
      };
    });
  }

  static async #getCurrency() {
    const getCurrency = await this.ninjaApi.currencyView.currency
      .getData(this.#currencyFilter)
      .then((data) => {
        return data;
      });

    const filtered = getCurrency.filter((currency) => {
      return currency.chaosEquivalent >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }
  static async #getFragment() {
    const getFragment = await this.ninjaApi.currencyView.fragment
      .getData(this.#currencyFilter)
      .then((data) => {
        return data;
      });

    const filtered = getFragment.filter((fragment) => {
      return fragment.chaosEquivalent >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }
  static async #getScarab() {
    const getScarabs = await this.ninjaApi.itemView.scarab
      .getData(this.#itemFilter)
      .then((data) => {
        return data;
      });

    const filtered = getScarabs.filter((scarab) => {
      return scarab.chaosValue >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }

  static async #getInvitation() {
    const getInvitation = await this.ninjaApi.itemView.invitation
      .getData(this.#itemFilter)
      .then((data) => {
        return data;
      });

    const filtered = getInvitation.filter((invitation) => {
      return invitation.chaosValue >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }

  static async #getMaps() {
    const maps = await this.ninjaApi.itemView.map
      .getData(this.#mapFilter)
      .then((data) => {
        return data;
      });

    const filtered = maps.filter((map) => {
      return map.mapTier === 17;
    });
    return await Promise.all(this.#postImage(filtered));
  }
}

module.exports = PoeNinja;
