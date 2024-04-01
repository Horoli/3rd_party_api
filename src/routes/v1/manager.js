const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");
const { hash } = require("bcryptjs");

module.exports = {
  "POST /sign_up": {
    // required body { masterId, masterPassword }
    middlewares: ["master"],
    async handler(req, res) {
      const { id, password } = req.body;

      const managerCol = await MongoDB.getCollection(
        Document.collections.MANAGER
      );

      const getManager = await Document.postValidation({
        collection: managerCol,
        query: {
          id: id,
        },
      });

      const hashedPassword = await Utility.hashPassword(password);

      const insertManager = {
        id: id,
        password: hashedPassword,
        status: {
          created: new Date(),
          enable: true,
        },
      };

      await managerCol.insertOne(insertManager);

      return new GeneralResponse({
        statusCode: 200,
        message: "manager created success",
        data: insertManager,
      });
    },
  },

  "POST /sign_in": {
    middlewares: [],
    async handler(req, res) {
      const { id, password } = req.body;

      const managerCol = await MongoDB.getCollection(
        Document.collections.MANAGER
      );

      const tokenCol = await MongoDB.getCollection(Document.collections.TOKEN);

      const getManager = await Document.getValidation({
        collection: managerCol,
        query: {
          id: id,
        },
      });

      const compare = await Utility.comparePassword(
        password,
        getManager.password
      );

      if (!compare) {
        throw Error("Password is incorrect");
      }

      const getToken = await tokenCol.findOne({
        manager: id,
      });

      const newToken = Utility.UUID();

      // getToken이 존재하면 update
      if (!!getToken) {
        await tokenCol.updateOne(
          {
            manager: id,
          },
          {
            $set: {
              token: newToken,
              created: new Date(),
              ExpireAt: new Date(Date.now() + 60 * 60 * 1000),
            },
          }
        );
      } else {
        const setToken = {
          manager: id,
          token: newToken,
          created: new Date(),
          // ExpireAt은 created로 부터 1시간 후로 설정
          ExpireAt: new Date(Date.now() + 60 * 60 * 1000),
        };

        await tokenCol.insertOne(setToken);
      }

      return new GeneralResponse({
        statusCode: 200,
        message: "manager sign in success",
        data: {
          token: newToken,
        },
      });
    },
  },
};
