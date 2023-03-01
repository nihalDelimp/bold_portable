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
        user_type: {
            type: Sequelize.ENUM,
            values: ['USER', 'ADMIN', 'RANDOM'],
            defaultValue: 'USER',
        }
    },
        { timestamps: true }
    );

    return User;
};