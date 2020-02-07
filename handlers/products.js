const db = require("../models");

exports.getAllProducts = async function (req, res, next) {
    try {
        let products = await db.Product.find();
        return res.status(200).json(products);
    } catch (err) {
        return next(err)
    }
}

exports.getProduct = async function (req, res, next) {
    try {
        let foundProduct = await db.Product.findById(req.params.product_id);
        return res.status(200).json(foundProduct);
    } catch (err) {
        return next(err);
    }
}

exports.getRecent = async function (req, res, next) {
    try {
        let foundProducts = await db.Product.find().sort({ $natural: -1 }).limit(3);
        return res.status(200).json(foundProducts);
    } catch (err) {
        return next(err);
    }
}
