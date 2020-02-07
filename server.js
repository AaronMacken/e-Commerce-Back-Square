require("dotenv").config();
const app = require("express")();
const { adminRequired } = require('./middleware/auth');
app.use(require("body-parser").json());


// routes
const paymentRoutes = require('./routes/payments');
app.use(paymentRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const productRoutesAdmin = require('./routes/productsAdmin');
app.use('/api/products', adminRequired, productRoutesAdmin);

const errorHandler = require('./handlers/errors');

// uploaded product images route
app.use('/uploads', require("express").static('uploads'))

// if none of the above routes are reached, display this error
app.use(function (req, res, next) {
  let err = new Error("Not Found!");
  err.status = 404;
  next(err);
});

// if the route was reached but there was an issue, use this errorHandler to format the error data
app.use(errorHandler);

app.listen(process.env.PORT || 3001, () => console.log("Listening on port 3001"));
