const Constants = require("@Utility/constants");
const MongoDB = require("@Utility/mongodb");

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
        url,
        tags,
      } = req.body;

      return {
        data: "Hello World",
      };
    },
  },
};
