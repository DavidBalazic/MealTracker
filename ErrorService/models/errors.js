class Errors {
  static errors = [];
  constructor() {
    if (this instanceof StaticClass)
      throw Error("A static class cannot be instantiated.");
  }
  static newError(message, code) {
    this.errors.push({ message, code });
  }
  static getErrors() {
    return this.errors;
  }
  static clearErrors() {
    this.errors = [];
  }
  static getError(code) {
    return this.errors.find((error) => error.code === code);
  }
  static toJson() {
    return JSON.stringify(this.errors);
  }
}

module.exports = Errors;
