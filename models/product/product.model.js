module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
        },
        product_image_type: {
            type: Sequelize.STRING
        },
        product_image: {
            type: Sequelize.STRING
        },
        product_price: {
            type: Sequelize.INTEGER
        }
    },
        { timestamps: true }
    );

    return Product;
};