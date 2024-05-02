const Document = require("@Utility/document");
const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");
const GeneralResponse = require("@Utility/general_response");
const Utility = require("@Utility/index");
const SteamAPIInstance = require("@Utility/steamapi");
const { hash } = require("bcryptjs");
// import SteamAPI from "steamapi";

module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, res) {
      const steamApi = SteamAPIInstance.sharedInstance;

      const poeId = 238960;
      const userId = 76561198129330521n;

      //   console.log(await SteamAPIInstance.sharedInstance.getGameDetails(238960));

      //   console.log(await steamApi.getGamePlayerCounts(238960));

      //   const get = await steamApi.getGameNews(poeId);
      //   const get = await steamApi.getGameAchievementsPercentages(poeId);
      const get = await steamApi.getUserStats(userId, poeId);
      //   const get = await steamApi.getServers();
      console.log(get.length);

      return new GeneralResponse({
        statusCode: 200,
        message: "Hello World!",
        data: get,
      });
    },
  },
};
