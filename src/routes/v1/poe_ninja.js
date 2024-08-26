const PoeNinja = require("@Utility/poe_ninja");
const Axios = require("axios");
const Stream = require("stream");

module.exports = {
  "GET /": {
    middlewares: [],
    async handler(req, rep) {
      const ninjaCache = await PoeNinja.getCache();

      return ninjaCache;
    },
  },
  /// cache server proxy
  "GET /image/:uuid": {
    async handler(req, rep) {
      const { uuid } = req.params;
      console.log(uuid);
      try {
        const response = await Axios({
          method: "GET",
          url: `http://172.16.0.6:7100/image/${uuid}`,
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
