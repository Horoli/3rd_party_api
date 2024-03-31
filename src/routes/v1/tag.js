const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");

module.exports = {
  "POST /": {
    middlewares: ["manager"],
    async handler(req, res) {
      // const { manager } = req.params;
      const { type, label } = req.body;

      if (!label || !type) {
        throw Error("Bad Request : required parameters is empty(type, label)");
      }

      let convertType;

      switch (type.toUpperCase()) {
        case Constants.POE: {
          convertType = Constants.TYPE.PATH_OF_EXILE;
          break;
        }
        case Constants.WOW: {
          convertType = Constants.TYPE.WOW;
          break;
        }
      }
      console.log(convertType);

      const tagCol = await MongoDB.getCollection(Document.collections.TAG);

      const getData = await Document.postValidation({
        collection: tagCol,
        query: {
          type: convertType,
          label: label,
        },
      });

      const insertData = {
        type: convertType,
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
    middlewares: [],
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
