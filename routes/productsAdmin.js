const express = require("express");
const router = express.Router({ mergeParams: true });
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, './uploads/');
//   },
//   filename: function(req, file, cb) {
//       cb(null, Date.now() + file.originalname)
//   }
// });
// const upload = multer({storage: storage});

aws.config.update({
  secretAccessKey: process.env.S3AK,
  accessKeyId: process.env.S3KID,
  region: "us-east-2"
});

const s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "hippie-images",
    acl: 'public-read',
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});

// CRUD functions
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require("../handlers/productsAdmin");

// routes prefixed with /products on the server.js file
router.post("/", upload.single("productImage"), createProduct);

// product_id will be used as a variable for mongoose functions for finding documents by id
router
  .route("/:product_id")
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
