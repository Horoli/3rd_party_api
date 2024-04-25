const MongoDB = require("@Utility/mongodb");

class Document {
  static collections = {
    LEAGUE: "league",
    TAG: "tag",
    THIRD_PARTY: "thirdParty",
    USER_ACTION: "userAction",
    VISIT: "visit",
    IMAGE: "image",
    MASTER: "master",
    MANAGER: "manager",
    TOKEN: "token",
  };

  static async getDatas({ collection, query, queryOptions }) {
    const getDatas = await collection.find(query, queryOptions).toArray();

    return getDatas;
  }

  static async postValidation({ collection, query, queryOptions }) {
    const getData = await collection.findOne(query, queryOptions);

    if (!!getData) {
      const collectionName = collection.namespace.split(".")[1];
      throw Error(`${collectionName} Document already exists`);
    }
    return null;
  }

  static async getValidation({ collection, query, queryOptions }) {
    const getData = await collection.findOne(query, queryOptions);

    if (!getData) {
      const collectionName = collection.namespace.split(".")[1];
      throw Error(`${collectionName} Document not found`);
    }

    return getData;
  }
}

module.exports = Document;
