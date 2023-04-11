const { ctrlWrapper } = require('../utils');


const Contact = require("../models/contact");
const { HttpError } = require("../helpers");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find({ owner }, "-createdAt -updatedAt", { skip, limit }).populate("owner", "email");
  res.json(result);
};

const getById = async (req, res) => {
  const contactId = req.params.contactId;
  const resultById = await Contact.findById(contactId);
  if (!resultById) {
    throw HttpError(404, "Contact not found");
  }
  res.json(resultById);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContact)
};

const deleteById = async (req, res) => {
  const contactId = req.params.contactId;
  const erasedContact = await Contact.findByIdAndDelete(contactId);
  if (!erasedContact) {
    throw HttpError(404, "Contact not found");
  }
  res.json({
    message: `Contact with id: ${contactId} has been deleted *.*`
  })
};

const updateById = async (req, res) => {
    const contactId = req.params.contactId;
    // const { name, email, phone } = req.body
    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
    if (!updatedContact) {
      throw HttpError(404, "Contact not found");
    }
    res.json(updatedContact)
};

const updateFavorite = async (req, res) => {
    const contactId = req.params.contactId;
    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
    if (!updatedContact) {
      throw HttpError(404, "Contact not found");
    }
    res.json(updatedContact)
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  updateFavorite: ctrlWrapper(updateFavorite)
}