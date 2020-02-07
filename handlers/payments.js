const db = require('../models');
const { getFinalArr } = require('./dataCombiner')
const crypto = require('crypto');
const squareConnect = require('square-connect');


exports.processPayment = async function (req, res) {
    // initialize square
    // Set the Access Token
    const accessToken = process.env.SAT;
    // Set Square Connect credentials and environment
    const defaultClient = squareConnect.ApiClient.instance;
    // Configure OAuth2 access token for authorization: oauth2
    const oauth2 = defaultClient.authentications['oauth2'];
    oauth2.accessToken = accessToken;
    // Set 'basePath' to switch between sandbox env and production env
    // sandbox: https://connect.squareupsandbox.com
    // production: https://connect.squareup.com
    defaultClient.basePath = 'https://connect.squareupsandbox.com';

    // ------------------------- CALCULATE ORDER DETAILS -------------------------- //
    let totalPrice = 0;

    let sentProducts = req.body.checkoutItems.data.map(e => { // incoming data (array1)
        return e;
    });

    let productIds = req.body.checkoutItems.data.map(e => { // ids from incoming data
        return e.id;
    });

    let foundProducts = await db.Product.find() // actual products retrieved from ids (array2)
        .where("_id")
        .in(productIds)
        .exec();

    let finalArr = getFinalArr(sentProducts, foundProducts);

    for (let i = 0; i < finalArr.length; i++) {
        totalPrice += (finalArr[i].price * finalArr[i].qty);
    }

    if (totalPrice < 60) {
        totalPrice += 5.50
    }

    if (sentProducts.length === foundProducts.length) {
        let error;
        let status;
        try {
            // -------------------------- CREATE A CUSTOMER -------------------------- //
            const { checkoutItems } = req.body;
            // create customer object & assign the address object to it
            // include other customer attributes from request json
            const customer = new squareConnect.CreateCustomerRequest();
            customer.given_name = req.body.name;
            customer.email_address = req.body.email;
            customer.address = {
                address_line_1: req.body.streetAddress1,
                address_line_2: req.body.streetAddress2,
                locality: req.body.city,
                administrative_district_level_1: req.body.state,
                postal_code: req.body.zip
            }

            // initialize customer API client
            const customerApi = new squareConnect.CustomersApi();

            // Call create customer with our newly created object by calling the custoemr api function
            const newCustomer = await customerApi.createCustomer(customer);

            // create variable for customer ID for later use
            let customerId = newCustomer.customer.id;

            // // -------------------------- CREATE AN ORDER -------------------------- //

            // variables used for the order process
            const idempotency_key_order = crypto.randomBytes(22).toString('hex');
            const idempotency_fulfill_order = crypto.randomBytes(22).toString('hex');
            const locationId = process.env.LID;


            // initialize necessary squareConnect API objects
            const orderApiInstance = new squareConnect.OrdersApi();
            const orderRequest = new squareConnect.CreateOrderRequest();
            const orderObject = new squareConnect.Order();


            // ----- CREATE THE ORDER OBJECT ----- //
            orderObject.location_id = locationId;
            orderObject.customer_id = customerId;
            orderObject.line_items = finalArr.map((e) => {
                var lineItem = new squareConnect.OrderLineItem();
                lineItem.uid = `${e.id}`;
                lineItem.name = `${e.title}`;
                lineItem.quantity = `${e.qty}`;
                lineItem.base_price_money = {
                    amount: Number(e.price * 100),
                    currency: `USD`
                }
                return lineItem;
            });

            orderObject.fulfillments = [
                {
                    uid: idempotency_fulfill_order,
                    type: `SHIPMENT`,
                    shipment_details: {
                        carrier: 'USPS',
                        recipient: {
                            customer_id: customerId
                        }
                    }
                }
            ]
            if (totalPrice < 60) {
                orderObject.service_charges = [
                    {
                        name: "Shipping fee",
                        amount_money: {
                            amount: Number(550),
                            currency: "USD"
                        },
                        calculation_phase: 'TOTAL_PHASE'
                    }
                ]
            }



            // --- assign orderRequst values ----- //
            orderRequest.order = orderObject;
            orderRequest.idempotency_key = idempotency_key_order;


            // FINALLY ... create the order!
            const newOrder = await orderApiInstance.createOrder(locationId, orderRequest);
            const orderId = newOrder.order.id;

            // -------------------------- CREATE A TRANSACTION -------------------------- //

            // length of idempotency_key should be less than 45
            const idempotency_key = crypto.randomBytes(22).toString('hex');
            // Charge the customer's card
            const payments_api = new squareConnect.PaymentsApi();
            const request_body = {
                source_id: req.body.nonce,
                amount_money: {
                    amount: Number((totalPrice * 100)),
                    currency: 'USD'
                },
                idempotency_key: idempotency_key,
                order_id: orderId
            };

            const responseP = await payments_api.createPayment(request_body);
            status = "success";
            totalPrice = 0;
        } catch (error) {
            status = "failure";
            totalPrice = 0;
            console.log(error)
        }
        res.json({ error, status })
    } else {
        status = "failure";
        totalPrice = 0;
        let err = new Error("Invoice to database conflict.")
        console.log(err);
        res.json({ err, status })
    }

}
