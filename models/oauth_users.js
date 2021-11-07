"use strict";
const bcrypt = require("bcrypt-nodejs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class oauth_users extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            oauth_users.hasOne(models.oauth_tokens, {
                foreignKey: "userId",
                as: "token",
            });
        }
    }
    oauth_users.init(
        {
            username: DataTypes.STRING,
            password: DataTypes.STRING,
            name: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "oauth_users",
        }
    );
    oauth_users.beforeSave((user) => {
        if (user.changed("password"))
            user.password = bcrypt.hashSync(
                user.password,
                bcrypt.genSaltSync(10),
                null
            );
    });
    return oauth_users;
};
