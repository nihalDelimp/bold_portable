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
        }
    },
        { timestamps: true }
    );

    return User;
};