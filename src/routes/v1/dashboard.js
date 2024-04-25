const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");

module.exports = {
  "GET /:type": {
    middlewares: [],
    async handler(req, rep) {
      const { type } = req.params;

      const leagueCol = await MongoDB.getCollection(
        Document.collections.LEAGUE
      );
      // const imageCol = await MongoDB.getCollection(Document.collections.IMAGE);
      const tagCol = await MongoDB.getCollection(Document.collections.TAG);

      const typeNullCheck = !type;

      let getTags;

      switch (typeNullCheck) {
        case true: {
          getTags = await Document.getDatas({
            collection: tagCol,
            query: {
              "status.enable": true,
            },
            queryOptions: {
              projection: { _id: 0, status: 0 },
            },
          });
          break;
        }
        case false: {
          const convertType = parseInt(type);
          getTags = await Document.getDatas({
            collection: tagCol,
            query: {
              type: convertType,
              "status.enable": true,
            },
            queryOptions: {
              projection: { _id: 0, status: 0 },
            },
          });
          break;
        }
      }

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

      return new GeneralResponse({
        statusCode: 200,
        message: "",
        data: {
          tags: getTags,
          leagues: getLeagues,
        },
      });
    },
  },
};
