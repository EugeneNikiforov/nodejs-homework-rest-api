const express = require('express')
const Joi = require('joi');
const validate = require('../../helpers/validateBody');
const contacts = require("../../models/contacts");
const { HttpError } = require("../../helpers");

const router = express.Router()

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
});

const schemaId = Joi.string().regex(/^[a-zA-Z0-9]+$/);

router.get('/', async (req, res, next) => {
  try {
    const result = await contacts.listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
})

router.get('/:contactId', validate.byId(schemaId), async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const resultById = await contacts.getContactById(contactId);
    if (!resultById) {
      throw HttpError(404, "Contact not found");
    }
    res.json(resultById);
  } catch (error) {
    next(error);
  }
})

router.post('/', validate.body(schemaAdd), async (req, res, next) => {
  try {
    const { name, email, phone } = req.body
    const newContact = await contacts.addContact(name, email, phone)
    res.status(201).json(newContact)
  } catch (error) {
    next(error);
  }
})

router.delete('/:contactId', validate.byId(schemaId), async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const erasedContact = await contacts.removeContact(contactId);
    if (!erasedContact) {
      throw HttpError(404, "Contact not found");
    }
    res.json({
      message: `Contact with id: ${contactId} has been deleted *.*`
    })
  } catch (error) {
    next(error);
  }
})

router.put('/:contactId', validate.body(schemaAdd), async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { name, email, phone } = req.body
    const updatedContact = await contacts.updateContact(contactId, name, email, phone);
    if (!updatedContact) {
      throw HttpError(404, "Contact not found");
    }
    res.json(updatedContact)
  } catch (error) {
    next(error);
  }
})

module.exports = router
