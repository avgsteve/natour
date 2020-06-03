/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// ==================================
//process.on ==> event listener
//global error handling - Stops the server from accepting new connections and keeps existing connections
process.on('unhandledRejection', err => {
  // https://nodejs.org/api/process.html#process_event_unhandledrejection

  console.log('\n\n=== global error handling ===\n');
  console.log(err.name, err.message); //see below for full error log

  console.log("UNHANDLED REJECTION! 🤔 And shutting down now...");

  server.close(() => {
    //ref: https://nodejs.org/api/net.html#net_server_close_callback
    process.exit(1);
  });


  // console.log('\n\n=== global error handling ===\n\n');
  // console.log(err); //see below for full error log

  /* === global error handling log ===

  MongooseError [MongooseServerSelectionError]: Could not connect to any servers in your MongoDB Atlas cluster. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://docs.atlas.mongodb.com/security-whitelist/.
      at new MongooseServerSelectionError (D:\Dropbox\Udemy\JavaScript\complete-node-bootcamp\4-natours\node_modules\mongoose\lib\error\serverSelection.js:24:11)
      at NativeConnection.Connection.openUri (D:\Dropbox\Udemy\JavaScript\complete-node-bootcamp\4-natours\node_modules\mongoose\lib\connection.js:823:32)
      at Mongoose.connect (D:\Dropbox\Udemy\JavaScript\complete-node-bootcamp\4-natours\node_modules\mongoose\lib\index.js:333:15)
      at Object.<anonymous> (D:\Dropbox\Udemy\JavaScript\complete-node-bootcamp\4-natours\server.js:20:10)
      at Module._compile (internal/modules/cjs/loader.js:1158:30)
      at Object.Module._extensions..js (internal/modules/cjs/loader.js:1178:10)
      at Module.load (internal/modules/cjs/loader.js:1002:32)
      at Function.Module._load (internal/modules/cjs/loader.js:901:14)
      at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:74:12)
      at internal/main/run_main_module.js:18:47 {
    message: "Could not connect to any servers in your MongoDB Atlas cluster. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://docs.atlas.mongodb.com/security-whitelist/.",
    name: 'MongooseServerSelectionError',
    reason: TopologyDescription {
      type: 'ReplicaSetNoPrimary',
      setName: null,
      maxSetVersion: null,
      maxElectionId: null,
      servers: Map {
        'cluster0-shard-00-00-pjopu.mongodb.net:27017' => [ServerDescription],
        'cluster0-shard-00-01-pjopu.mongodb.net:27017' => [ServerDescription],
        'cluster0-shard-00-02-pjopu.mongodb.net:27017' => [ServerDescription]
      },
      stale: false,
      compatible: true,
      compatibilityError: null,
      logicalSessionTimeoutMinutes: null,
      heartbeatFrequencyMS: 10000,
      localThresholdMS: 15,
      commonWireVersion: null
    },
    [Symbol(mongoErrorContextSymbol)]: {}
  }
  */

});

process.on('uncaughtException', err => {

  console.log("uncaught exception! 🤔 And shutting down now...");
  console.log('\n\n=== uncaughtException error log ===\n');
  console.log(err.name, err.message); //see below for full error log

  server.close(() => {
    process.exit(1);
  });

});


//==============  DATABASE RELATED SECTION  ================

dotenv.config({
  path: './config.env'
});


//use DB and replace password string with env
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

// ------- Mongoose ------------

// will return a promise obj with using Mongoose
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true // to hide deprication error warning message in terminal
}).then(connection => {
  //to show connections properties
  // console.log(connection.connections);
  console.log("\n\nConnection is successful!  (●'◡'●)\n\n");
});
// .catch(
//   err => console.log(err)
// );



//=======================================================


const app = require("./app"); // getting all config from app.js , so use nodemon server.js to start server

const port = process.env.PORT || 3000; // the port to be used for the localhost page

const server = app.listen(port, () => {
  console.log("\x1b[31m",
    `\n\n(from ${scriptName}:) =>> App running on port: ${port}...` + "\x1b[0m" + `\n\nThe full address is: ${'\x1b[4m'}http://127.0.0.1:${port}` +
    "\x1b[0m" + "\n\n");

  //IIFE with a IIFE has a delayed log
  (
    () => {
      setTimeout(() => {
        console.log("Establishing connection to database ...");
      }, 1000);
    }
  )();

});
