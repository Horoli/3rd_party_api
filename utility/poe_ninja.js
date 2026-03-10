const Axios = require("axios");
const Constants = require("@Utility/constants");
const { NinjaAPI, WatchAPI } = require("poe-api-manager");

class PoeNinja {
  constructor() {}

  static ninjaApi = new NinjaAPI("Mirage");
  static watchApi = new WatchAPI("Mirage");
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

  static async #getScarabData() {
    // 1. 기존 라이브러리 코드를 사용하여 아이템 정보(id, name, icon 등) 가져오기
    const getScarabs = await this.ninjaApi.itemView.scarab
      .getData(this.#itemFilter)
      .then((data) => {
        return data;
      });

    // 2. 신규 API에서 가격 정보만 가져오기
    const url = "https://poe.ninja/poe1/api/economy/exchange/current/overview?league=Mirage&type=Scarab";
    try {
      const response = await Axios.get(url);
      const { lines, items } = response.data;

      // 2-1. ID -> Name 매핑 생성 (신규 API 응답 기준)
      const idToNameMap = new Map();
      items.forEach((item) => {
        idToNameMap.set(item.id, item.name);
      });

      // 2-2. Name -> Price 매핑 생성
      const nameToPriceMap = new Map();
      lines.forEach((line) => {
        const itemName = idToNameMap.get(line.id);
        if (itemName) {
          nameToPriceMap.set(itemName, line.primaryValue);
        }
      });

      // 3. 기존 데이터의 chaosValue를 "name" 기준으로 매칭하여 교체
      return getScarabs.map((scarab) => {
        if (nameToPriceMap.has(scarab.name)) {
          scarab.chaosValue = nameToPriceMap.get(scarab.name);
        }
        return scarab;
      });
    } catch (error) {
      console.error("Error fetching scarab prices from new API:", error.message);
      return getScarabs; // API 호출 실패 시 기존 데이터 유지
    }
  }

  static async #getAllScarab() {
    // setCache에서 처리하므로 삭제하거나 getScarabData 호출로 대체 가능
    return await this.#getScarabData();
  }

  static async #getScarab() {
    // setCache에서 처리하므로 삭제하거나 필터링 로직 포함 가능
    const data = await this.#getScarabData();
    return data.filter(
      (scarab) => scarab.chaosValue >= this.#standardChaosValue,
    );
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
