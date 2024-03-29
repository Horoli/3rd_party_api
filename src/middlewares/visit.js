const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");

module.exports = async (req, rep) => {
  const { id, platform } = req.params;

  const idWithoutHyphens = id.replace(/-/g, "");

  const visitCol = await MongoDB.getCollection(Document.collections.VISIT);

  const getVisit = await visitCol.findOne({
    user: idWithoutHyphens,
    platform: platform,
    "visited.latest": {
      $gte: Date.now() - 1000 * 60 * 60 * 24,
    },
  });

  if (!getVisit) {
    const newVisit = {
      user: idWithoutHyphens,
      platform: platform,
      visited: {
        latest: Date.now(),
      },
    };

    await visitCol.insertOne(newVisit);
  }
};
