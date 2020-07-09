/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    // === required parameters(properties) ====
    payment_method_types: ['card'],
    // url is the page for redirecting the user to after payment is successful
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    //
    line_items: [ //
      //ref:  https://stripe.com/docs/api/checkout/sessions/create?lang=node#create_checkout_session-line_items
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`${tour.imageCover}`],
        // unit: cents * 100 = one dollar
        amount: tour.price * 100,
        currency: 'AUD',
        quantity: 1,
      }, //
    ],
    mode: 'payment',
    // ==== optional parameters(properties)
    // To create a new booking
    client_reference_id: req.params.tourId,


  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session: session,
  });




});
