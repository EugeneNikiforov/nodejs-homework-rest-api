const express = require('express')
const validate = require('../../helpers/validateBody');

const ctrl = require('../../controllers/contacts');
const schemas = require('../../schemas/contacts');
const { authenticate, isValidId } = require('../../middleWares');

const router = express.Router();

router.get('/', authenticate, ctrl.getAll);

router.get('/:contactId', authenticate, isValidId, validate.byId(schemas.schemaId), ctrl.getById);

router.post('/', authenticate, validate.body(schemas.schemaAdd), ctrl.add);

router.delete('/:contactId', authenticate, isValidId, validate.byId(schemas.schemaId), ctrl.deleteById);

router.put('/:contactId', authenticate, isValidId, validate.body(schemas.schemaAdd), ctrl.updateById);

router.patch('/:contactId/favorite', authenticate, isValidId, validate.body(schemas.schemaUpadateFavorite), ctrl.updateFavorite);

module.exports = router
