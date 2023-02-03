module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            isEmail: true,
            unique: true,
            notEmpty: true
        },
        password: {
            type: Sequelize.STRING,
            notEmpty: true,
            allowNull: false
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: false
        },
        angle_api_keys: {
            type: Sequelize.STRING,
            unique: true,
        },
        angel_password: {
            type: Sequelize.STRING,
        },
        angel_totp_token: {
            type: Sequelize.STRING,
            unique: true,
        },
        angel_client_id: {
            type: Sequelize.STRING,
            unique: true,
        }
    },
        { timestamps: true }
    );

    return User;
};