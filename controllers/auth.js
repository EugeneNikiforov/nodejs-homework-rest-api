const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');
const { ctrlWrapper } = require('../utils');

const User = require("../models/user");

const { HttpError, sendEmail } = require("../helpers");
const avatarDir = path.join(__dirname, "../", "public", "avatars");
const { SECRET_KEY, BASE_URL } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpError(409, 'Email in use');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });
    
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/users/verify/${verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);
    res.status(201).json({
        User: {
            email: newUser.email,
            subscription: newUser.subscription
        }
    })
};

const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });

    res.status(200).json({
        message: "Verification successful"
    })
}

const resendEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(404, 'User not found');
    }
    if (!user.verify) {
        throw HttpError(400, 'Verification has already been passed');
    }
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/users/verify/${user.verificationToken}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail);

    res.json({
        message: "Verification email sent"
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, 'Email is wrong');
    }
    if (!user.verify) {
        throw HttpError(401, 'Email not verify');
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
    if (!['starter', 'pro', 'business'].includes(newSubscription)) {
      throw HttpError(400, 'Invalid subscription value');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { subscription: newSubscription }, { new: true });
    if (!updatedUser) {
      throw HttpError(404, 'User not found');
    }
    return updatedUser;
};

const updateSubscription = async (req, res, next) => {
    const { subscription } = req.body;
    const userId = req.user._id;

        const updatedUser = await updateUserSubscription(userId, subscription);
        res.json(updatedUser);
};

const updateAvatar = async (req, res) => {
    const { path: tempUpload, filename } = req.file;
    const { _id } = req.user;
    const savename = `${_id}_${filename}`;
    const resultUpload = path.join(avatarDir, savename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", savename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({ avatarURL });
}

module.exports = {
    register: ctrlWrapper(register),
    verifyEmail: ctrlWrapper(verifyEmail),
    resendEmail: ctrlWrapper(resendEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar)
}