const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();

const app = require('../app');
const { User } = require('../models/user');
const { DB_HOST, PORT } = process.env;

describe("test auth controller", () => {
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

    test('test login', async () => {
        const newUser = {
            password: "234567",
            email: "ashiok@teros.com",
            subscription: "pro"
        };
        const user = await User.create(newUser);
        const loginUser = {
            password: "234567",
            email: "ashiok@teros.com"
        };

        const response = await request(app).post("/users/login").send(loginUser);
        expect(response.statusCode).toBe(200);
        const { body } = response;
        expect(body.token).toBeTruthy();
        expect(typeof body.token).toBe("string");
        expect(typeof body.User).toBe("object");
        expect(body.User.email).toBeTruthy();
        expect(typeof body.User.email).toBe("string");
        expect(body.User.subscription).toBeTruthy();
        expect(typeof body.User.subscription).toBe("string");
    });
})
