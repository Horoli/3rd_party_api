const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");

module.exports = {
  "POST /:manager": {
    middleware: [],
    async handler(req, res) {
      const { manager } = req.params;
      const {
        type,
        label,
        mainDescription,
        subDescription,
        thumbnail,
        infoImages,
        mainUrl,
        tags,
      } = req.body;

      const thirdPartyCol = await MongoDB.getCollection("thirdParty");

      // TODO : 입력된 tags가 tagCol에 있는지 확인

      // TODO : type이 constants에 포함되어있는지 확인

      const getData = await Document.postValidation({
        collection: thirdPartyCol,
        query: {
          type: type,
          label: label,
        },
      });

      const insertData = {
        type: type,
        label: label,
        description: {
          main: mainDescription,
          sub: subDescription,
        },
        images: {
          thumbnail: thumbnail,
          info: infoImages,
        },
        url: {
          main: mainUrl,
        },
        status: {
          created: new Date(),
          enable: true,
        },
        tags: tags,
        userAction: {
          click: 0,
        },
      };

      const insertResult = await thirdPartyCol.insertOne(insertData);

      return new GeneralResponse({
        statusCode: 200,
        message: "thirdParty created success",
        data: insertData,
      });
    },
  },

  "GET /:tag": {
    middleware: [],
    async handler(req, rep) {
      const { tag } = req.params;

      console.log("tag", tag);

      const thirdPartyCol = await MongoDB.getCollection("thirdParty");

      const getThirdParties = await Document.getDatas({
        collection: thirdPartyCol,
        query: {
          tags: {
            $in: [tag],
          },
          "status.enable": true,
        },
        queryOptions: {
          projection: { _id: 0, status: 0 },
        },
      });

      console.log(getThirdParties);

      return new GeneralResponse({
        statusCode: 200,
        message: "",
        data: {
          // length: getThirdParties.length,
          thirdParties: getThirdParties,
        },
      });
    },
  },
};
