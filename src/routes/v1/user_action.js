const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = {
  "POST /:id": {
    middlewares: [],
    async handler(req, res) {
      const { id } = req.params;
      const { label, url, platform } = req.body;

      if (!label || !url || !id) {
        throw Error(
          "Bad Request : required parameters is empty(id, label, url)"
        );
      }

      console.log(label, url);

      const idWithoutHyphens = id.replace(/-/g, "");

      const thirdPartyCol = await MongoDB.getCollection(
        Document.collections.THIRD_PARTY
      );
      const userActionCol = await MongoDB.getCollection(
        Document.collections.USER_ACTION
      );

      // TODO : userActionCol에 5분 이내의 같은 action이 있는지 확인
      const getUserAction = await userActionCol.findOne({
        user: idWithoutHyphens,
        "action.label": label,
        "action.url": url,
        "action.latest": {
          $gte: new Date(Date.now() - 60 * 5 * 1000),
        },
      });

      // TODO : userActionCol에 5분 이내의 같은 action이 있으면 return
      if (!!getUserAction) {
        return new GeneralResponse({
          statusCode: 200,
          message: "already update userAction(5minute ago)",
          data: {},
        });
      }

      // TODO : userActionCol에 5분 이내의 같은 action이 없으면 insert
      const newUserAction = {
        user: idWithoutHyphens,
        platform: platform,
        action: {
          label: label,
          url: url,
          latest: new Date(Date.now()),
        },
      };

      await userActionCol.insertOne(newUserAction);

      const update = await Promise.all(
        await thirdPartyCol.findOneAndUpdate(
          {
            label: label,
            "url.main": url,
          },
          {
            $inc: {
              "userAction.click": 1,
            },
          },
          { returnDocument: "after" }
        )
      );

      return new GeneralResponse({
        statusCode: 200,
        message: "userAction update Complete",
        data: update,
      });
    },
  },
};
