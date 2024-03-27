const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");

module.exports = {
  "POST /:manager": {
    middleware: [],
    async handler(req, res) {
      const { manager } = req.params;
      const { type, label } = req.body;

      const tagCol = await MongoDB.getCollection("tag");

      const getData = await Document.postValidation({
        collection: tagCol,
        query: {
          type: type,
          label: label,
        },
      });

      const insertData = {
        type: type,
        label: label,
        status: {
          created: new Date(),
          enable: true,
        },
      };

      const insertResult = await tagCol.insertOne(insertData);

      return new GeneralResponse({
        statusCode: 200,
        message: "tag created success",
        data: insertData,
      });
    },
  },

  "GET /:type": {
    middleware: [],
    async handler(req, rep) {
      const { type } = req.params;

      console.log(type);

      const tagCol = await MongoDB.getCollection("tag");

      const getTags = await Document.getDatas({
        collection: tagCol,
        query: {
          type: parseInt(type),
          "status.enable": true,
        },
        queryOptions: {
          projection: { _id: 0, status: 0 },
        },
      });

      return new GeneralResponse({
        statusCode: 200,
        message: "",
        data: {
          tags: getTags,
        },
      });
    },
  },
};
