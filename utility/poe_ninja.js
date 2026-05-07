const Axios = require("axios");
const Constants = require("@Utility/constants");

class PoeNinja {
  constructor() {}

  static #league = process.env.POE_NINJA_LEAGUE || "Mirage";
  static #ninjaApiBase =
    "https://poe.ninja/poe1/api/economy/stash/current";
  static #ninjaExchangeApiBase =
    "https://poe.ninja/poe1/api/economy/exchange/current";
  static #cache = {};
  static #standardChaosValue = 50;

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
    const getScarabData = await this.#getScarabData();
    const getScarab = getScarabData.filter((scarab) => {
      return scarab.chaosValue >= this.#standardChaosValue;
    });

    console.log(getScarabData);
    const getInvitation = await this.#getInvitation();
    const getMaps = await this.#getMaps();

    this.#cache = {
      date: new Date().toLocaleString(),
      standardChaosValue: this.#standardChaosValue,
      divineOrb: getDivineOrb.chaosEquivalent,
      currency: getCurrency,
      fragment: getFragment,
      scarab: await Promise.all(this.#postImage(getScarab)),
      allScarab: await Promise.all(this.#postImage(getScarabData)),
      invitation: getInvitation,
      map: getMaps,
    };

    console.log(
      `[${new Date().toLocaleString()}] Poe.ninja cache update complete`,
    );
  }

  static async getDivineOrb() {
    return await this.#getDivineOrb();
  }

  static #requestOptions() {
    return {
      headers: {
        "Accept-Encoding": "identity",
      },
    };
  }

  static #currencyOverviewUrl(type) {
    return `${this.#ninjaApiBase}/currency/overview?league=${encodeURIComponent(
      this.#league,
    )}&type=${encodeURIComponent(type)}`;
  }

  static #itemOverviewUrl(type) {
    return `${this.#ninjaApiBase}/item/overview?league=${encodeURIComponent(
      this.#league,
    )}&type=${encodeURIComponent(type)}`;
  }

  static #exchangeOverviewUrl(type) {
    return `${this.#ninjaExchangeApiBase}/overview?league=${encodeURIComponent(
      this.#league,
    )}&type=${encodeURIComponent(type)}`;
  }

  static async #fetchNinjaData(url) {
    try {
      const response = await Axios.get(url, this.#requestOptions());
      return response.data;
    } catch (error) {
      throw new Error(
        `Error fetching poe.ninja data from ${url}: ${error.message}`,
      );
    }
  }

  static #normalizeIcon(icon) {
    if (!icon) {
      return icon;
    }

    const value = String(icon);
    if (/^https?:\/\/poe\.ninja\/gen\/image\//i.test(value)) {
      return value.replace(/^https?:\/\/poe\.ninja/i, "https://web.poecdn.com");
    }
    if (value.startsWith("/gen/image/")) {
      return `https://web.poecdn.com${value}`;
    }
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
    if (value.startsWith("/")) {
      return `https://poe.ninja${value}`;
    }
    return value;
  }

  static #normalizeCurrencyOverview(data) {
    const currencyDetails = Array.isArray(data.currencyDetails)
      ? data.currencyDetails
      : [];
    const detailsByName = new Map(
      currencyDetails.map((detail) => [detail.name, detail]),
    );

    return (Array.isArray(data.lines) ? data.lines : [])
      .map((line) => {
        const detail = detailsByName.get(line.currencyTypeName);
        if (!detail) {
          return null;
        }

        return {
          id: detail.id,
          name: detail.name,
          icon: this.#normalizeIcon(detail.icon),
          chaosEquivalent: line.chaosEquivalent,
        };
      })
      .filter(Boolean);
  }

  static #normalizeItemOverview(data) {
    return (Array.isArray(data.lines) ? data.lines : [])
      .map((line) => {
        const name = line.name || line.baseType;
        if (!name) {
          return null;
        }

        return {
          id: line.id || line.detailsId || name,
          name,
          icon: this.#normalizeIcon(line.icon),
          chaosValue: line.chaosValue,
          mapTier: line.mapTier,
        };
      })
      .filter(Boolean);
  }

  static #normalizeExchangeOverview(data) {
    const itemById = new Map();
    const register = (item) => {
      if (item?.id == null) {
        return;
      }
      itemById.set(String(item.id), item);
    };

    (Array.isArray(data.items) ? data.items : []).forEach(register);
    (Array.isArray(data.core?.items) ? data.core.items : []).forEach(register);

    return (Array.isArray(data.lines) ? data.lines : [])
      .map((line) => {
        const lineId = line?.id != null ? String(line.id) : "";
        const item = lineId ? itemById.get(lineId) : null;
        const name = item?.name || line.name || line.currencyTypeName;
        const chaosValue = Number(
          line.primaryValue ?? line.chaosValue ?? line.value,
        );

        if (!name || !Number.isFinite(chaosValue)) {
          return null;
        }

        return {
          id: item?.detailsId || line.detailsId || lineId || name,
          name,
          icon: this.#normalizeIcon(item?.image || item?.icon || line.icon),
          chaosValue,
        };
      })
      .filter(Boolean);
  }

  static #postImage(filtered) {
    return filtered.map(async (data) => {
      const result = await Axios({
        method: "post",
        url: `${Constants.URL_IMAGE_CACHE}`,
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
    const currency = await this.#getCurrencyData();
    const divineOrb = currency.find((data) => data.name === "Divine Orb");

    if (!divineOrb) {
      throw new Error("Divine Orb data was not found in poe.ninja response");
    }

    return {
      currencyTypeName: divineOrb.name,
      chaosEquivalent: divineOrb.chaosEquivalent,
    };
  }

  static async #getCurrencyData() {
    const data = await this.#fetchNinjaData(
      this.#currencyOverviewUrl("Currency"),
    );
    return this.#normalizeCurrencyOverview(data);
  }

  static async #getFragmentData() {
    const data = await this.#fetchNinjaData(
      this.#currencyOverviewUrl("Fragment"),
    );
    return this.#normalizeCurrencyOverview(data);
  }

  static async #getCurrency() {
    const getCurrency = await this.#getCurrencyData();

    const filtered = getCurrency.filter((currency) => {
      return currency.chaosEquivalent >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }

  static async #getFragment() {
    const getFragment = await this.#getFragmentData();

    const filtered = getFragment.filter((fragment) => {
      return fragment.chaosEquivalent >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }

  static async #getScarabData() {
    const data = await this.#fetchNinjaData(this.#exchangeOverviewUrl("Scarab"));
    return this.#normalizeExchangeOverview(data);
  }

  static async #getAllScarab() {
    return await this.#getScarabData();
  }

  static async #getScarab() {
    const data = await this.#getScarabData();
    return data.filter(
      (scarab) => scarab.chaosValue >= this.#standardChaosValue,
    );
  }

  static async #getInvitation() {
    const data = await this.#fetchNinjaData(this.#itemOverviewUrl("Invitation"));
    const getInvitation = this.#normalizeItemOverview(data);

    const filtered = getInvitation.filter((invitation) => {
      return invitation.chaosValue >= this.#standardChaosValue;
    });

    return await Promise.all(this.#postImage(filtered));
  }

  static async #getMaps() {
    const data = await this.#fetchNinjaData(this.#itemOverviewUrl("Map"));
    const maps = this.#normalizeItemOverview(data);
    return await Promise.all(this.#postImage(maps));
  }
}

module.exports = PoeNinja;
