const express = require("express");

const validate = require('../../helpers/validateBody');
const schemas = require('../../schemas/users');
const ctrl = require('../../controllers/auth');
const { authenticate } = require('../../middleWares');

const router = express.Router();

router.post('/users/register', validate.body(schemas.registerSchema), ctrl.register);

router.post('/users/login', validate.body(schemas.loginSchema), ctrl.login);

router.post('/users/logout', authenticate, ctrl.logout);

router.get('/users/current', authenticate, ctrl.getCurrent);

router.patch('/users', authenticate, ctrl.updateSubscription);

module.exports = router;