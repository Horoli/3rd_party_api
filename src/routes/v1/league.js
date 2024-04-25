const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = {
  "POST /league": {
    middlewares: ["manager"],
    async handler(req, res) {
      const { label, version, thumbnail, start, end, endState, state } =
        req.body;

      const leagueCol = await MongoDB.getCollection(
        Document.collections.LEAGUE
      );

      let imageId = null;
      if (!!thumbnail) {
        await imageCol.insertOne({
          id: imageId,
          contents: thumbnail,
          type: "base64String",
          category: "leagueThumbnail",
          status: {
            created: new Date(),
            enable: true,
          },
        });
      }

      const createLeague = {
        label,
        version,
        thumbnail,
        period: {
          start: start,
          end: end,
          endState: endState,
        },
        status: {
          state: state,
        },
      };

      return new GeneralResponse({
        statusCode: 200,
        message: "get league list success",
        data: {
          leagueList: result,
        },
      });
    },
  },
};
