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

      const tagsCol = await MongoDB.getCollection("tags");

      const getData = await Document.postValidation({
        collection: tagsCol,
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

      const insertResult = await tagsCol.insertOne(insertData);

      return new GeneralResponse({
        statusCode: 200,
        message: "tag created success",
        data: insertData,
      });
    },
  },
};
