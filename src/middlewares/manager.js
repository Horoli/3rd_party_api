const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = async (req, rep) => {
  const { token } = req.body;

  const tokenCol = await MongoDB.getCollection(Document.collections.TOKEN);

  const getToken = await Document.getValidation({
    collection: tokenCol,
    query: {
      token: token,
    },
  });

  // TODO : token validation
  // getToken.expireAt이 현재시간보다 작으면 만료된 토큰
  if (getToken.expireAt < Date.now()) {
    throw Error("Token is expired");
  }

  // getToken.expireAt이 현재시간보다 크면 유효한 토큰
  // token이 유효한 경우, expireAt을 현재시간 + 1시간으로 변경
  //   if (getToken.expireAt > Date.now()) {
  await tokenCol.updateOne(
    {
      token: token,
    },
    {
      $set: {
        expireAt: Date.now() + 1000 * 60 * 60,
      },
    }
  );
  //   }
};
