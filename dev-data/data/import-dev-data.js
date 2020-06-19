/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel'); // in tourModel.js , const Tour = mongoose.model('Tour', tourSchema);
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');


console.log(`\nExecuting ${scriptName}... \n`);

dotenv.config({
  path: `./config.env`

  // path: `/../../config.env`
  // // /data/ -> dev-data -> natours

});

//==============  DATABASE RELATED SECTION  ================

//use DB and replace password string with env
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

// ------- Mongoose ------------

// will return a promise obj with using Mongoose
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true // to hide deprication error warning message in terminal
}).then(() => {
  //to show connections properties
  console.log(`\nDB connections via ${__filename} successful!  (●'◡'●) \n`);
});

//Read json file and convert it javascript obj format
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


//create data based on the Schema of Tour
const importData = async () => {
  try {
    //pass the argument as Documents to insert, as a spread or array
    await Tour.create(tours); //ref:  https://mongoosejs.com/docs/api.html#model_Model.create
    await Review.create(reviews);
    await User.create(users, {
      // to skip the passwordConfirm field
      validateBeforeSave: false
    });

    console.log('==== Data succussfully loaded! ====');

  } catch (error) {
    console.log(error);
  }
  process.exit();

};

//Delete all data from
const deleteData = async () => {

  try {
    //delete all data
    await Tour.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});


    console.log('==== Data succussfully deleted! ====');

  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//getting process.argv with current executing cli command
console.log(`\nThe process.argv: \n`);
console.log(process.argv);
/*// In CLI, will show following:

[
  'C:\\Program Files\\nodejs\\node.exe',
  'D:\\Dropbox\\Udemy\\JavaScript\\complete-node-bootcamp\\4-natours\\dev-data\\
data\\import-dev-data.js',
  '--importData'
]

[
  NativeConnection {
    base: Mongoose {
      connections: [Circular],
      models: [Object],
      modelSchemas: [Object],
      options: [Object],
      _pluralize: [Function: pluralize],
      Schema: [Function],
      model: [Function],
      plugins: [Array]
    },
    collections: { tours: [NativeCollection] },
    models: { Tour: Model { Tour } },
    config: { autoIndex: true, useCreateIndex: true, useFindAndModify: false },
    replica: false,
    options: null,
    otherDbs: [],
    relatedDbs: {},
    states: [Object: null prototype] {
      '0': 'disconnected',
      '1': 'connected',
      '2': 'connecting',
      '3': 'disconnecting',
      '99': 'uninitialized',
      disconnected: 0,
      connected: 1,
      connecting: 2,
      disconnecting: 3,
      uninitialized: 99
    },
    _readyState: 1,
    _closeCalled: false,
    _hasOpened: true,
    plugins: [],
    id: 0,
    _listening: false,
    _connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      promiseLibrary: [Function: Promise],
      driverInfo: [Object]
    },
    client: MongoClient {
      _events: [Object: null prototype],
      _eventsCount: 2,
      _maxListeners: undefined,
      s: [Object],
      topology: [NativeTopology],
      [Symbol(kCapture)]: false
    },
    '$initialConnection': Promise { [Circular] },
    name: 'natours',
    host: 'cluster0-shard-00-00-pjopu.mongodb.net',
    port: 27017,
    user: '.....',
    pass: '...dqopdkqpodkqpod',
    db: Db {
      _events: [Object: null prototype],
      _eventsCount: 3,
      _maxListeners: undefined,
      s: [Object],
      serverConfig: [Getter],
      bufferMaxEntries: [Getter],
      databaseName: [Getter],
      [Symbol(kCapture)]: false
    }
  }
]


*/

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//type the commnands: (cli at 4-natours folder)
//node ./dev-data/data/import-dev-data.js --delete
//node ./dev-data/data/import-dev-data.js --import
