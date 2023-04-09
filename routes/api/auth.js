const express = require("express");

const validate = require('../../helpers/validateBody');
const schemas = require('../../schemas/users');
const ctrl = require('../../controllers/auth');

const router = express.Router();

router.post('/users/register', validate.body(schemas.registerSchema), ctrl.register);

router.post('/users/login', validate.body(schemas.loginSchema), ctrl.login);

module.exports = router;