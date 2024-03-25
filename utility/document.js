const MongoDB = require("@Utility/mongodb");

class Document {
  static async postValidation({ collection, query, queryOptions }) {
    const getData = await collection.findOne({
      query,
      queryOptions,
    });

    if (!!getData) {
      const collectionName = collection.namespace.split(".")[1];
      throw Error(`${collectionName} Document already exists`);
    }
    return null;
  }

  static async getValidation({ collection, query, queryOptions }) {
    const getData = await collection.findOne({
      query,
      queryOptions,
    });

    if (!getData) {
      const collectionName = collection.namespace.split(".")[1];
      throw Error(`${collectionName} Document not found`);
    }

    return getData;
  }
}

module.exports = Document;
