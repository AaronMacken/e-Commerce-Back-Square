const mongoose = require('mongoose');
mongoose.set('debug', true);

mongoose.Promise = Promise;

mongoose.connect(process.env.DATABASEURI || 'mongodb://localhost/hippieHouse', {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

module.exports.Admin = require('./admin');
module.exports.Product = require('./product');