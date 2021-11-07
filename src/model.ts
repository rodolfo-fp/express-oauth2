const bcrypt = require("bcrypt-nodejs");
const OAuthTokensModel = require("../models").oauth_tokens;
const OAuthClientsModel = require("../models").oaut_clients;
const OAuthUsersModel = require("../models").oauth_users;
const JWT = require("jsonwebtoken");

const model = module.exports;

const JWT_ISSUER = "thisdemo";
const JWT_SECRET_FOR_ACCESS_TOKEN = "XT6PRpRuehFsyMa2";
const JWT_SECRET_FOR_REFRESH_TOKEN = "JWPVzFWkqGxoE2C2";

model.JWT_ACCESS_TOKEN_EXPIRY_SECONDS = 1800; // 30 minutes

model.generateAccessToken = function (client, user, scope, callback) {
    const payload = { iss: JWT_ISSUER, userId: user.id };
    const secret = JWT_SECRET_FOR_ACCESS_TOKEN;
    const expiresIn = model.JWT_ACCESS_TOKEN_EXPIRY_SECONDS;
    const token = JWT.sign(payload, secret, { expiresIn });

    callback(false, token);
};

model.getAccessToken = function (bearerToken, callback) {
    return JWT.verify(
        bearerToken,
        JWT_SECRET_FOR_ACCESS_TOKEN,
        function (err, decoded) {
            if (err) return callback(err, false); // the err contains JWT error data

            return OAuthTokensModel.findOne({
                where: {
                    accessToken: bearerToken,
                },
                include: [
                    {
                        model: OAuthClientsModel,
                        as: "client",
                    },
                    {
                        model: OAuthUsersModel,
                        as: "user",
                    },
                ],
            })
                .then((token) => {
                    const data: any = new Object();
                    for (const prop in token.get()) data[prop] = token[prop];
                    return callback(false, {
                        ...data,
                        expires: new Date(decoded.exp),
                        client: data.client.get(),
                        user: data.user.get(),
                    });
                })
                .catch((error) => console.error(error));
        }
    );
};

model.getClient = function (clientId, clientSecret) {
    return OAuthClientsModel.findOne({
        where: { clientId: clientId, clientSecret: clientSecret },
        raw: true,
    });
};

model.getRefreshToken = function (refreshToken, callback) {
    return OAuthTokensModel.findOne({
        where: {
            refreshToken: refreshToken,
        },
        include: [
            {
                model: OAuthClientsModel,
                as: "client",
            },
            {
                model: OAuthUsersModel,
                as: "user",
            },
        ],
    })
        .then((token) => {
            const data: any = new Object();
            for (const prop in token.get()) data[prop] = token[prop];
            data.client = data.client.get();
            data.user = data.user.get();
            console.log(data);
            return data;
        })
        .catch((error) => console.error(error));
};

model.getUser = function (username, password) {
    return OAuthUsersModel.findOne({ where: { username: username } }).then(
        (user) => {
            const isMatch = bcrypt.compareSync(password, user.get().password);
            if (isMatch) return user.get();
            else console.error("Password not match");
        }
    );
};

model.saveToken = function (token, client, user) {
    return OAuthTokensModel.create({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.id,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        userId: user.id,
    })
        .then((token) => {
            const data: any = new Object();
            for (const prop in token.get()) data[prop] = token[prop];
            data.client = data.clientId;
            data.user = data.userId;

            return data;
        })
        .catch((error) => console.error(error));
};

model.revokeToken = function (token) {
    console.log("Revoke token");
    return OAuthTokensModel.findOne({
        where: { refreshToken: token.refreshToken },
    })
        .then((refreshToken) => {
            console.log(refreshToken);
            return refreshToken
                .destroy()
                .then(() => {
                    return !!refreshToken;
                })
                .catch((error) => console.error(error));
        })
        .catch((error) => console.error(error));
};

model.setClient = function (client) {
    return OAuthClientsModel.create({
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        redirectUris: client.redirectUris,
        grants: client.grants,
    })
        .then((client) => {
            client =
                client && typeof client == "object" ? client.toJSON() : client;
            const data: any = new Object();
            for (const prop in client) data[prop] = client[prop];
            data.client = data.clientId;
            data.grants = data.grants;

            return data;
        })
        .catch((error) => console.error(error));
};

model.setUser = function (user) {
    return OAuthUsersModel.create({
        username: user.username,
        password: user.password,
        name: user.name,
    })
        .then((userResult) => {
            userResult =
                userResult && typeof userResult == "object"
                    ? userResult.toJSON()
                    : userResult;
            const data: any = new Object();
            for (const prop in userResult) data[prop] = userResult[prop];
            data.username = data.username;
            data.name = data.name;

            return data;
        })
        .catch((error) => console.error(error));
};

export default model;
