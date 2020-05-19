// ref:
// https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/learn/lecture/15065070

MVC: (Model, View and Controller)

Model: Business logic
Code that actually solves the business problems we set out to solve.



View: Presentation logic

Controller: Application logic

ex the work flow:
  http request > router(tourRouter.js) > Controller(the
    function to send response like tourController.js)

  -- - > Model(Business logic)
