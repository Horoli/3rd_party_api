const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = async (req, rep) => {
  const { masterId, masterPassword } = req.body;

  const masterCol = await MongoDB.getCollection(Document.collections.MASTER);

  const getMaster = await Document.getValidation({
    collection: masterCol,
    query: {
      id: masterId,
      password: masterPassword,
    },
  });
};
