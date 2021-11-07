"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class oaut_clients extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            oaut_clients.hasOne(models.oauth_tokens, {
                foreignKey: "clientId",
                as: "token",
            });
        }
    }
    oaut_clients.init(
        {
            clientId: DataTypes.STRING,
            clientSecret: DataTypes.STRING,
            redirectUris: DataTypes.STRING,
            grants: DataTypes.ARRAY(DataTypes.STRING),
        },
        {
            sequelize,
            modelName: "oaut_clients",
        }
    );
    return oaut_clients;
};
