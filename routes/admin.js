const express = require("express"),
    router = express.Router();
const {signup, signin} = require("../handlers/admin");

router.post("/signup", signup);
router.post("/signin", signin);

module.exports = router;