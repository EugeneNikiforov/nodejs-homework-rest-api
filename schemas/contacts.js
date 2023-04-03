const Joi = require('joi');

const schemaAdd = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": `"name" must be exist`,
    "string.base": `"name" must be string`,
    "string.empty": `"name" cannot be empty`,
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required().messages({
    "any.required": `"email" must be exist`,
    "string.base": `"email" must be string`,
    "string.empty": `"email" cannot be empty`,
  }),
  phone: Joi.string().required().messages({
    "any.required": `"phone" must be exist`,
    "string.base": `"phone" must be string`,
    "string.empty": `"phone" cannot be empty`,
  }),
  favorite: Joi.boolean(),
});

const schemaId = Joi.string().regex(/^[a-zA-Z0-9]+$/);

const schemaUpadateFavorite = Joi.object({
  favorite: Joi.boolean().required()
})

module.exports = {
    schemaAdd,
  schemaId,
    schemaUpadateFavorite
}