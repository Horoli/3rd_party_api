const Constants = require("@Utility/constants");
const GeneralResponse = require("@Utility/general_response");
const PoeNinja = require("@Utility/poe_ninja");
const Axios = require("axios");

module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const ninjaCache = await PoeNinja.getCache();

      return new GeneralResponse({
        statusCode: 200,
        message: "get poe ninja cache",
        data: ninjaCache,
      });
    },
  },
  /// cache server proxy
  "GET /image/:uuid": {
    async handler(req, rep) {
      const { uuid } = req.params;
      try {
        const response = await Axios({
          method: "GET",
          url: `${Constants.URL_IMAGE_CACHE}/${uuid}`,
          // url: `http://172.16.0.6:7100/image/${uuid}`,
          // url: `http://127.0.0.1:7100/image/${uuid}`,
          responseType: "stream",
        });

        rep.headers(response.headers);

        return rep.send(response.data);
      } catch (err) {
        throw Error(err);
      }
    },
  },
};
