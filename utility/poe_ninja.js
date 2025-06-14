const Axios = require("axios");
const Constants = require("@Utility/constants");
const { NinjaAPI } = require("poe-api-manager");

class PoeNinja {
  constructor() {}

  static ninjaApi = new NinjaAPI("Mercenaries");
  static #cache = {};
  static #standardChaosValue = 50;
  static #currencyFilter = ["id", "name", "icon", "chaosEquivalent"];
  static #itemFilter = ["id", "name", "icon", "chaosValue"];
  static #mapFilter = ["id", "name", "icon", "chaosValue", "mapTier"];

  /**
   *
   * @param {String} filter : allScarab, ...
   * @returns
   */
  static async getCache(filter) {
    if (!!filter) {
      return {
        date: this.#cache.date,
        filteredData: this.#cache[filter],
      };
    }

    const { allScarab, ...filteredCache } = this.#cache;
    return filteredCache;
  }

  static async setCache() {
    console.log(`[${new Date().toLocaleString()}] Poe.ninja cache updating...`);
    const getDivineOrb = await this.#getDivineOrb();
    const getCurrency = await this.#getCurrency();
    const getFragment = await this.#getFragment();
    const getScarab = await this.#getScarab();
    const getAllScarab = await this.#getAllScarab();
    const getInvitation = await this.#getInvitation();
    const getMaps = await this.#getMaps();

    this.#cache = {
      date: new Date().toLocaleString(),
      standardChaosValue: this.#standardChaosValue,
      divineOrb: getDivineOrb.chaosEquivalent,
      currency: getCurrency,
      fragment: getFragment,
      scarab: getScarab,
      allScarab: getAllScarab,
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
        url: `${Constants.URL_IMAGE_CACHE}`,
        // url: "http://127.0.0.1:7100/image",
        // url: "http://172.16.0.6:7100/image",
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

  static async #getDivineOrb() {
    return await this.ninjaApi.currencyView.currency
      .getQuickCurrency()
      .then((data) => {
        return data;
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

  static async #getAllScarab() {
    const getScarabs = await this.ninjaApi.itemView.scarab
      .getData(this.#itemFilter)
      .then((data) => {
        return data;
      });

    return await Promise.all(this.#postImage(getScarabs));
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
