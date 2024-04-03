const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = {
  "GET /visit": {
    middlewares: [],
    async handler(req, res) {
      const visitCol = await MongoDB.getCollection(Document.collections.VISIT);

      const result = await visitCol.count();

      return new GeneralResponse({
        statusCode: 200,
        message: "get visit count success",
        data: {
          visitCount: result,
        },
      });
    },
  },

  "GET /action": {
    middlewares: [],
    async handler(req, res) {
      const thirdPartyCol = await MongoDB.getCollection(
        Document.collections.THIRD_PARTY
      );

      // 내림차순으로 정렬
      const result = await thirdPartyCol
        .find({}, { projection: { _id: 0, label: 1, userAction: 1 } })
        .sort({ userAction: -1 })
        .toArray();

      return new GeneralResponse({
        statusCode: 200,
        message: "get visit count success",
        data: {
          visitCount: result,
        },
      });
    },
  },
};
