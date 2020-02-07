const db = require("../models"),
  jwt = require("jsonwebtoken");

exports.signin = async function(req, res, next) {
  // try finding admin with username passed in from req.body.username
  try {
    let admin = await db.Admin.findOne({
      username: req.body.username
    });
    let { id, username } = admin;
    let isMatch = await admin.comparePassword(req.body.password);
    if (isMatch) {
      let token = jwt.sign(
        {
          id,
          username
        },
        process.env.SECRET_KEY_JWT
      );
      return res.status(200).json({
        id,
        username,
        token
      });
    } else {
      return next({
        status: 400,
        message: "Invalid e-mail or password."
      });
    }
  } catch (e) {
    return next({ status: 400, message: "Invalid e-mail or password." });
  }
};

exports.signup = async function(req, res, next) {
  if (req.body.adminCode === process.env.ADMIN_CODE) {
    try {
      // create admin object with the incoming data
      let admin = await db.Admin.create(req.body);
      let { id, username } = admin;
      // create token payload with destructured admin data
      let token = jwt.sign(
        {
          id,
          username
        },
        process.env.SECRET_KEY_JWT
      );
      // send back the created data
      return res.status(200).json({
        id,
        username,
        token
      });
    } catch (err) {
      // if validation fails
      if (err.code === 11000) {
        err.message = "Username or e-mail already in use.";
      }
      return next({
        status: 400,
        message: err.message
      });
    }
  } else {
    return next({
      status: 401,
      message: "Invalid credentials."
    });
  }
};
