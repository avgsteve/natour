/*jshint esversion: 6 */
/*jshint esversion: 8 */
import axios from 'axios';
const stripe = Stripe('pk_test_51H2t20BCkhJwkrSTcuj9BVtugBS9RBWhE9Gt9FKkJpZn07gBQZJTOaAF4AyQikpOc8W5r99Qtu5MxjY28FHI77fF00m1aAdLGm'); // get public key from: https://dashboard.stripe.com/test/apikeys
import {
  showAlert
} from './alerts';


/*Notes:
1. This stripe.js is imported by index.js as "bookTour()" as a front-end function used to GET SESSION from backend API.

2. The function bookTour() is triggered by DOM element #book-tour in tour.pug at URL http://hostnamn/tour/(tour-slug)

3. The end-point for API is /api/v1/bookings/checkout-session/${tourId}`
*/

/* documentation:
   #1 Use .js file in HTML:
https://stripe.com/docs/js/including
*/

export const bookTour = async tourId => {


  try {
    // 1) Get checkout session via API from backend
    const sessionForCheckout = await axios(`/api/v1/bookings/checkout-session/${tourId}`); // will trigger bookingController.getCheckoutSession

    //  Log session data in browser
    console.log('\n  (from js/stripe.js) The session  for checkout created with the tour id sent to server with axios: ' + tourId + ":\n");
    console.log(sessionForCheckout);

    // 2) Create checkout form +charge credit cards
    //    ref: https://stripe.com/docs/js/checkout/redirect_to_checkout
    await stripe.redirectToCheckout({

      sessionId: sessionForCheckout.data.session.id,
    });

    // 3)


  } catch (error) {

    console.log(error);
    showAlert("error", error);

  }

};

/* log from the   console.log(sessionForCheckout);

// {
//   "data": {
//     "status": "success",
//     "session": {
//       "id": "cs_test_L3qX8YJukiomRcQ6xOqInINVgz0fJsOUYB0XKWH6Bi5mWXdlz7jMlOZB",
//       "object": "checkout.session",
//       "billing_address_collection": null,
//       "cancel_url": "http://127.0.0.1:3000/tours/the-park-camper",
//       "client_reference_id": "5c88fa8cf4afda39709c2961",
//       "customer": null,
//       "customer_email": null,
//       "display_items": [
//         {
//           "amount": 149700,
//           "currency": "aud",
//           "custom": {
//             "description": "Breathing in Nature in America's most spectacular National Parks",
//             "images": [
//               "http://127.0.0.1:3000/img/tours/tour-5-cover.jpg"
//             ],
//             "name": "The Park Camper Tour"
//           },
//           "quantity": 1,
//           "type": "custom"
//         }
//       ],
//       "livemode": false,
//       "locale": null,
//       "metadata": {},
//       "mode": "payment",
//       "payment_intent": "pi_1H3DvjBCkhJwkrSTxU2p5Ftc",
//       "payment_method_types": [
//         "card"
//       ],
//       "setup_intent": null,
//       "shipping": null,
//       "shipping_address_collection": null,
//       "submit_type": null,
//       "subscription": null,
//       "success_url": "http://127.0.0.1:3000/"
//     }
//   },
//   "status": 200,
//   "statusText": "OK",
//   "headers": {
//     "connection": "keep-alive",
//     "content-length": "868",
//     "content-type": "application/json; charset=utf-8",
//     "date": "Fri, 10 Jul 2020 04:33:47 GMT",
//     "etag": "W/\"364-EcrbhjXSdP11mOTSdqjyymT74BY\"",
//     "strict-transport-security": "max-age=15552000; includeSubDomains",
//     "x-content-type-options": "nosniff",
//     "x-dns-prefetch-control": "off",
//     "x-download-options": "noopen",
//     "x-frame-options": "SAMEORIGIN",
//     "x-ratelimit-limit": "100",
//     "x-ratelimit-remaining": "99",
//     "x-ratelimit-reset": "1594359220",
//     "x-xss-protection": "1; mode=block"
//   },
//   "config": {
//     "url": "http://127.0.0.1:3000/api/v1/bookings/checkout-session/5c88fa8cf4afda39709c2961",
//     "headers": {
//       "Accept": "application/json, text/plain, */
// *"
//     },
//     "transformRequest": [
//       null
//     ],
//     "transformResponse": [
//       null
//     ],
//     "timeout": 0,
//     "xsrfCookieName": "XSRF-TOKEN",
//     "xsrfHeaderName": "X-XSRF-TOKEN",
//     "maxContentLength": -1,
//     "method": "get"
//   },
//   "request": {}
// }
