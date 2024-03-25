module.exports = {
  "POST /": {
    middleware: [],
    async handler(req, res) {
      const { manager } = req.params;
      return {
        data: "Hello World",
      };
    },
  },
};
