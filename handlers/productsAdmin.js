const db = require("../models");
const aws = require("aws-sdk");

exports.createProduct = async function(req, res, next) {
  try {
    let product = await db.Product.create({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      productImage: req.file.location
    });
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.updateProduct = async function(req, res, next) {
  try {
    // find DB document by req.params.product_id, update JSON with req.body, return updated object via json
    console.log(req.body.payload);
    let foundProductUpdate = await db.Product.findOneAndUpdate(
      { _id: req.params.product_id },
      req.body.payload,
      { new: true }
    );
    return res.status(200).json(foundProductUpdate);
  } catch (err) {
    return next(err);
  }
};


exports.deleteProduct = async function(req, res, next) {
  const S3 = new aws.S3();
  try {
    // remove item from DB
    let foundProductDelete = await db.Product.findById(req.params.product_id);
    await foundProductDelete.remove();

    let params = {
      Bucket: 'hippie-images',
      Key: foundProductDelete.productImage.split('/').slice(-1)[0]
    }

    S3.deleteObject(params, (err, data) => {
      if(err){
        console.log(err)
      }
    })

    return res.status(200).json(foundProductDelete);
  } catch (err) {
    return next(err);
  }
};
