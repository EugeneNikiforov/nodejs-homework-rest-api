const express = require('express')
const validate = require('../../helpers/validateBody');

const ctrl = require('../../controllers/contacts');
const schemas = require('../../schemas/contacts');
const { isValidId } = require('../../middleWares');

const router = express.Router();

router.get('/', ctrl.getAll);

router.get('/:contactId', isValidId, validate.byId(schemas.schemaId), ctrl.getById);

router.post('/', validate.body(schemas.schemaAdd), ctrl.add);

router.delete('/:contactId', isValidId, validate.byId(schemas.schemaId), ctrl.deleteById);

router.put('/:contactId', isValidId, validate.body(schemas.schemaAdd), ctrl.updateById);

router.patch('/:contactId/favorite', isValidId, validate.body(schemas.schemaUpadateFavorite), ctrl.updateFavorite);

module.exports = router
