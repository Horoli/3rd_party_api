const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

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

      const convertType = parseInt(type);

      const thirdPartyCol = await MongoDB.getCollection("thirdParty");
      const imageCol = await MongoDB.getCollection("image");

      // TODO : 입력된 tags가 tagCol에 있는지 확인

      // TODO : type이 constants에 포함되어있는지 확인

      // TODO : type

      console.log("aaa");

      const getData = await Document.postValidation({
        collection: thirdPartyCol,
        query: {
          type: convertType,
          label: label,
        },
      });

      let imageId = null;

      if (!!thumbnail) {
        imageId = Utility.UUID(true);

        await imageCol.insertOne({
          id: imageId,
          contents: thumbnail,
          type: "base64String",
          status: {
            created: new Date(),
            enable: true,
          },
        });
      }

      const insertData = {
        type: convertType,
        label: label,
        description: {
          main: mainDescription,
          sub: subDescription ?? null,
        },
        images: {
          thumbnail: imageId,
          info: infoImages ?? null,
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
      // console.log(insertData);
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

      const thirdPartyCol = await MongoDB.getCollection("thirdParty");

      const tagNullCheck = !tag;

      console.log(tagNullCheck);

      let getThirdParties;

      switch (tagNullCheck) {
        case true: {
          getThirdParties = await Document.getDatas({
            collection: thirdPartyCol,
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
          getThirdParties = await Document.getDatas({
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
          break;
        }
      }

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
