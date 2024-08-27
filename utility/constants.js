class Constants {
  static POE = "PATHOFEXILE";
  static WOW = "WORLDOFWARCRAFT";

  static IS_LOCAL = false;
  static URL_IMAGE_CACHE = this.IS_LOCAL
    ? "http://127.0.0.1:7100/image"
    : "http://172.16.0.6:7100/image";

  static POE_ID = 238960;

  static TYPE = {
    PATH_OF_EXILE: 0,
    WOW: 1,
  };
}

module.exports = Constants;
