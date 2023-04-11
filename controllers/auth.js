const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ctrlWrapper } = require('../utils');

const User = require("../models/user");

const { HttpError } = require("../helpers");
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpError(409, 'Email in use');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({...req.body, password: hashPassword});
    res.status(201).json({
        User: {
            email: newUser.email,
            subscription: newUser.subscription
        }
    })
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, 'Email is wrong');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, 'Password is wrong');
    }
    const payload = {
        contactId: user._id
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
        token,
        User: {
            email: user.email,
            subscription: user.subscription
        }
    })
}

const getCurrent = async (req, res) => {
    const { email } = req.user;
    res.json({ email });
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json({ message: "Logout success" });
}

async function updateUserSubscription(userId, newSubscription) {
  try {
    if (!['starter', 'pro', 'business'].includes(newSubscription)) {
      throw HttpError(400, 'Invalid subscription value');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { subscription: newSubscription }, { new: true });
    if (!updatedUser) {
      throw HttpError(404, 'User not found');
    }
    return updatedUser;
    } catch (error) {
        next(HttpError(400));
    }
};

const updateSubscription = async (req, res, next) => {
    const { subscription } = req.body;
    const userId = req.user._id;

    try {
        const updatedUser = await updateUserSubscription(userId, subscription);
        res.json(updatedUser);
    } catch (error) {
        next(HttpError(400));
    }
};

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription)
}