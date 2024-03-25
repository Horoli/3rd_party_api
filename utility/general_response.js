class GeneralResponse {
  constructor({ statusCode, message, data }) {
    if (!!statusCode) this.statusCode = statusCode;
    if (!!message) this.message = message;
    if (!!data) this.data = data;
  }
}

module.exports = GeneralResponse;
