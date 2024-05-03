const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const SteamAPIInstance = require("@Utility/steamapi");

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

      // switch (typeNullCheck) {
      //   case true: {
      //     getTags = await Document.getDatas({
      //       collection: tagCol,
      //       query: {
      //         "status.enable": true,
      //       },
      //       queryOptions: {
      //         projection: { _id: 0, status: 0 },
      //       },
      //     });
      //     break;
      //   }
      //   case false: {
      //     const convertType = parseInt(type);
      //     getTags = await Document.getDatas({
      //       collection: tagCol,
      //       query: {
      //         type: convertType,
      //         "status.enable": true,
      //       },
      //       queryOptions: {
      //         projection: { _id: 0, status: 0 },
      //       },
      //     });
      //     break;
      //   }
      // }

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
          currentPlayers: currentPlayers,
          tags: getTags,
          leagues: getLeagues,
        },
      });
    },
  },
};
