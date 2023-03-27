const { HttpError } = require("./index");

const body = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing required name field");
    }
    next();
  };
};

const byId = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params.contactId);
    if (error || !req.params.contactId) {
      return res.status(404).json({ message: "Not found" });
    }
    next();
  };
};

module.exports = {
    body,
    byId,
}