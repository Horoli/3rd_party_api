class SteamAPIInstance {
  #instance = undefined;

  async connect(apiKey) {
    const steamApiModule = await import("steamapi")
      .then((module) => module.default)
      .catch((err) => err);
    if (steamApiModule instanceof Error) return steamApiModule;

    this.#instance = new steamApiModule(apiKey);
  }

  getGameDetails(gameId) {
    return this.#instance.getGameDetails(gameId);
  }

  getGamePlayerCounts(gameId) {
    return this.#instance.getGamePlayers(gameId);
  }

  getGameAchievementsPercentages(gameId) {
    return this.#instance.getGameAchievementPercentages(gameId);
  }

  getGameNews(gameId) {
    return this.#instance.getGameNews(gameId);
  }

  getUserStats(userId, gameId) {
    return this.#instance.getUserStats(userId, gameId);
  }

  static #instanceSymbol = Symbol("SteamAPIInstance");
  static get sharedInstance() {
    if (!this[SteamAPIInstance.#instanceSymbol])
      this[SteamAPIInstance.#instanceSymbol] = new SteamAPIInstance();
    return this[SteamAPIInstance.#instanceSymbol];
  }
}

module.exports = SteamAPIInstance;
