const mongoose = require('mongoose');
const request = require('supertest');
const gravatar = require('gravatar');
require('dotenv').config();

const app = require('../app');
const User = require('../models/user');
const { DB_HOST, PORT } = process.env;

describe("test auth controllers", () => {
    let server;
    beforeAll(() => { server = app.listen(PORT) });
    afterAll(() => { server.close() });
 
    beforeEach((done) => {
        mongoose.connect(DB_HOST).then(() => { done() });
    })
    afterEach((done) => {
        mongoose.connection.db.dropCollection(() => {
            mongoose.connection.close(() => { done() });
        })
    })

    test('test login controller', async () => {
        const newUser = {
            password: "234567",
            email: "ashiok@teros.com",
            subscription: "pro",
            avatarURL: gravatar.url("ashiok@teros.com")
        };
        const user = await User.create(newUser);
        const loginUser = {
            password: "234567",
            email: "ashiok@teros.com"
        };

        const response = await request(app).post("/api/auth/users/login").send(loginUser);
        expect(response.statusCode).toBe(200);
        const { body } = response;
        const { token } = await User.findById(user._id);
        expect(body.token).toBeTruthy();
        expect(body.token).toBe(token);
        expect(typeof body.token).toBe("string");
        expect(typeof body.user).toBe("object");
        expect(body.user.email).toBeTruthy();
        expect(typeof body.user.email).toBe("string");
        expect(body.user.subscription).toBeTruthy();
        expect(typeof body.user.subscription).toBe("string");
    }, 20000);
})
