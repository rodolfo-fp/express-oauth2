import express from "express";
import ExpressOAuthServer from "express-oauth-server";
import oauth2Model from "./model";

const app = express();

app.use(express.json());
app.use(express.urlencoded());

const serverOptions: ExpressOAuthServer.Options = {
    model: oauth2Model,
    useErrorHandler: true,
    continueMiddleware: false,
    accessTokenLifetime: oauth2Model.JWT_ACCESS_TOKEN_EXPIRY_SECONDS, // expiry time in seconds, consistent with JWT setting in model.js
    refreshTokenLifetime: 1209600, // 14 days
};
const expressOAuthServer: ExpressOAuthServer = new ExpressOAuthServer(
    serverOptions
);

app.post("/oauth/token", expressOAuthServer.token());

app.post("/oauth/set_client", function (req, res, next) {
    oauth2Model
        .setClient(req.body)
        .then((client) => res.json(client))
        .catch((error) => next(error));
});

app.post("/oauth/signup", function (req, res, next) {
    oauth2Model
        .setUser(req.body)
        .then((user) => res.json(user))
        .catch((error) => next(error));
});

app.get("/secret", expressOAuthServer.authenticate(), function (req, res) {
    res.json("Secret area");
});

app.listen(3333, () => console.log("Server is running!"));
