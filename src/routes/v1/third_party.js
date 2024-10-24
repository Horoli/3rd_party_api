const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");
// const fs = require("fs");
// const path = require("path");
// const { get } = require("http");

module.exports = {
  "POST /": {
    middlewares: ["manager"],
    async handler(req, res) {
      const {
        type,
        label,
        mainDescription,
        subDescription,
        thumbnail,
        infoImages,
        mainUrl,
        manualUrl,
        tags,
      } = req.body;

      // if (!label || !url || !id) {
      //   throw Error(
      //     "Bad Request : required parameters is empty(id, label, url)"
      //   );
      // }

      let convertType;

      switch (type.toUpperCase()) {
        case Constants.POE: {
          convertType = Constants.TYPE.PATH_OF_EXILE;
          break;
        }
        case Constants.POE2: {
          convertType = Constants.TYPE.PATH_OF_EXILE;
          break;
        }
        // TODO : pathOfExile2 추가
        /**
         *
         */
        case Constants.WOW: {
          convertType = Constants.TYPE.WOW;
          break;
        }
      }
      console.log(convertType);

      const thirdPartyCol = await MongoDB.getCollection(
        Document.collections.THIRD_PARTY
      );
      const imageCol = await MongoDB.getCollection(Document.collections.IMAGE);

      // TODO : 입력된 tags가 tagCol에 있는지 확인

      // TODO : type이 constants에 포함되어있는지 확인

      // TODO : type

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
          category: "thirdPartyThumbnail",
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
          sub: subDescription ?? "",
        },
        images: {
          thumbnail: imageId,
          info: infoImages ?? [],
        },
        url: {
          main: mainUrl,
          manual: manualUrl,
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
      console.log(insertData);
      const insertResult = await thirdPartyCol.insertOne(insertData);

      return new GeneralResponse({
        statusCode: 200,
        message: "thirdParty created success",
        data: insertData,
      });
    },
  },

  /**
   *  type : 0(pathofExile), 1(pathofExile2), 2(wow)
   */
  "GET /:tag/platform/:platform/id/:id": {
    middlewares: ["visit"],
    async handler(req, rep) {
      const { tag, platform, id } = req.params;
      let { type } = req.query;

      type = type === undefined ? Constants.TYPE.PATH_OF_EXILE : parseInt(type);

      console.log(type, tag, platform, id);

      const thirdPartyCol = await MongoDB.getCollection(
        Document.collections.THIRD_PARTY
      );
      const imageCol = await MongoDB.getCollection(Document.collections.IMAGE);

      const tagIsAll = tag === "ALL" ? true : false;
      // 입력받은 type이 null이면 0(pathofExile), 아니면 입력받은 type

      query = {
        "status.enable": true,
        type: type,
      };
      if (tagIsAll === false) {
        query.tags = {
          $in: [tag],
        };
      }

      const getThirdParties = await Document.getDatas({
        collection: thirdPartyCol,
        query: query,
        queryOptions: {
          projection: { _id: 0, status: 0 },
        },
      });

      await Promise.all(
        await getThirdParties.map(async (thirdParty) => {
          const getImage = await imageCol.findOne(
            {
              id: thirdParty.images.thumbnail,
            },
            { projection: { _id: 0, status: 0 } }
          );

          thirdParty.images.thumbnail = getImage.contents;
        })
      );

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

  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const thirdPartyCol = await MongoDB.getCollection(
        Document.collections.THIRD_PARTY
      );

      const getThirdParties = await thirdPartyCol.find({}).toArray();

      return new GeneralResponse({
        statusCode: 200,
        message: "",
        data: getThirdParties,
      });
    },
  },
};
