"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class oauth_tokens extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            oauth_tokens.belongsTo(models.oaut_clients, {
                foreignKey: "clientId",
                as: "client",
            });
            oauth_tokens.belongsTo(models.oauth_users, {
                foreignKey: "userId",
                as: "user",
            });
        }
    }
    oauth_tokens.init(
        {
            accessToken: DataTypes.STRING,
            accessTokenExpiresAt: DataTypes.DATE,
            refreshToken: DataTypes.STRING,
            refreshTokenExpiresAt: DataTypes.DATE,
            clientId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "oauth_tokens",
        }
    );
    return oauth_tokens;
};
