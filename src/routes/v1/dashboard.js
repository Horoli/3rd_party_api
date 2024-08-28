const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const SteamAPIInstance = require("@Utility/steamapi");
const PoeNinja = require("@Utility/poe_ninja");

module.exports = {
  "GET /:type": {
    middlewares: [],
    async handler(req, rep) {
      const { type } = req.params;

      const leagueCol = await MongoDB.getCollection(
        Document.collections.LEAGUE
      );
      const tagCol = await MongoDB.getCollection(Document.collections.TAG);
      const steamApi = SteamAPIInstance.sharedInstance;
      const divineOrb = await PoeNinja.ninjaApi.currencyView.currency
        .getQuickCurrency()
        .then((data) => {
          return data;
        });

      const currentPlayers = await steamApi.getGamePlayerCounts(
        Constants.POE_ID
      );

      const typeNullCheck = !type;

      const getTagsQuery = typeNullCheck
        ? { "status.enable": true }
        : { type: parseInt(type), "status.enable": true };

      const getTags = await Document.getDatas({
        collection: tagCol,
        query: getTagsQuery,
        queryOptions: {
          projection: { _id: 0, status: 0 },
        },
      });

      // state가 legacy가 아닌 데이터만 가져옴
      const getLeagues = await Document.getDatas({
        collection: leagueCol,
        query: {
          "status.state": { $ne: "legacy" },
        },
        queryOptions: {
          projection: { _id: 0 },
        },
      });

      return new GeneralResponse({
        statusCode: 200,
        message: "",
        data: {
          divineOrb: divineOrb.chaosEquivalent,
          currentPlayers: currentPlayers,
          tags: getTags,
          leagues: getLeagues,
        },
      });
    },
  },
};
