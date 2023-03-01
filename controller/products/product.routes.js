const router = require('express').Router();
const productController = require('./product.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const apiResponse = require("../../helpers/apiResponse");

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.split("/")[0] === "image") {
//         cb(null, true);
//     }
//     else {
//         cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
//     }
// };
// var storage = multer.memoryStorage();

// var upload = multer({
//     storage: storage, limits: {
//         fileSize: 700000000
//     },
//     fileFilter
// });

// const upload = multer({ dest: "public/files" });
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new Error("NOT A IMAGE FILE!!"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// login for existing users
router.post('/add-products', checkAuth, hasRole('ADMIN'), upload.single('product_image'), productController.addNewProducts);

//register a new user
router.get('/get-products', productController.getAllProducts);


module.exports = router;