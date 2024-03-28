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

      if (!label || !type) {
        throw Error("Bad Request : required parameters is empty(type, label)");
      }

      const tagCol = await MongoDB.getCollection(Document.collections.TAG);

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

      const tagCol = await MongoDB.getCollection(Document.collections.TAG);

      const typeNullCheck = !type;
      console.log(typeNullCheck);

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
