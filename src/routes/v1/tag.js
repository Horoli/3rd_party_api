module.exports = {
  "POST /": {
    middleware: [],
    async handler(req, res) {
      return {
        data: "Hello World",
      };
    },
  },
};
