const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = {
  "POST /": {
    // middlewares: [],
    middlewares: ["manager"],
    async handler(req, res) {
      const {
        label,
        version,
        officialApi,
        thumbnail,
        start,
        end,
        endState,
        state,
      } = req.body;

      // TODO : start, end는 저장하기 전에 TZ 적용

      const localStart = Utility.getLocalTime(start);
      const localEnd = Utility.getLocalTime(end);

      const leagueCol = await MongoDB.getCollection(
        Document.collections.LEAGUE
      );
      // const imageCol = await MongoDB.getCollection(Document.collections.IMAGE);

      // let imageId = null;
      // if (!!thumbnail) {
      //   imageId = Utility.UUID(true);
      //   await imageCol.insertOne({
      //     id: imageId,
      //     contents: thumbnail,
      //     type: "base64String",
      //     category: "leagueThumbnail",
      //     status: {
      //       created: new Date(),
      //       enable: true,
      //     },
      //   });
      // }

      const createLeague = {
        label: label,
        version: version,
        // thumbnail: imageId,
        officialApi: officialApi,
        period: {
          start: localStart,
          end: localEnd,
          startState: "",
          endState: endState,
        },
        status: {
          state: state,
        },
      };

      await leagueCol.insertOne(createLeague);

      return new GeneralResponse({
        statusCode: 200,
        message: `post ${version} ${label} league success`,
      });
    },
  },
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const leagueCol = await MongoDB.getCollection(
        Document.collections.LEAGUE
      );
      // const imageCol = await MongoDB.getCollection(Document.collections.IMAGE);

      const getLeagues = await Document.getDatas({
        collection: leagueCol,
        query: {
          "status.state": { $ne: "legacy" },
        },
        queryOptions: {
          projection: { _id: 0 },
        },
      });

      // await Promise.all(
      //   getLeagues.map(async (league) => {
      //     const getThumbnail = await Document.getValidation({
      //       collection: imageCol,
      //       query: {
      //         id: league.thumbnail,
      //       },
      //     });

      //     league.thumbnail = getThumbnail.contents;
      //   })
      // );

      return getLeagues;
    },
  },
};
