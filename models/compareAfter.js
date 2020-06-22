Query {
  _mongooseOptions: {
    populate: {
      user: [PopulateOptions],
      tour: [PopulateOptions]
    }
  },
  _transforms: [],
  _hooks: Kareem {
    _pres: Map {},
    _posts: Map {}
  },
  _executionCount: 1,
  mongooseCollection: NativeCollection {
    collection: Collection {
      s: [Object]
    },
    Promise: [Function: Promise],
    _closed: false,
    opts: {
      bufferCommands: true,
      capped: false,
      autoCreate: undefined,
      Promise: [Function: Promise],
      '$wasForceClosed': undefined
    },
    name: 'reviews',
    collectionName: 'reviews',
    conn: NativeConnection {
      base: [Mongoose],
      collections: [Object],
      models: [Object],
      config: [Object],
      replica: false,
      options: null,
      otherDbs: [],
      relatedDbs: {},
      states: [Object: null prototype],
      _readyState: 1,
      _closeCalled: false,
      _hasOpened: true,
      plugins: [],
      id: 0,
      _listening: false,
      _connectionOptions: [Object],
      client: [MongoClient],
      '$initialConnection': [Promise],
      name: 'natours',
      host: 'cluster0-shard-00-00-pjopu.mongodb.net',
      port: 27017,
      user: 'steveleng',
      pass: 'BojLO0179hJ9kGYV',
      db: [Db]
    },
    queue: [],
    buffer: false,
    emitter: EventEmitter {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: undefined,
      [Symbol(kCapture)]: false
    }
  },
  model: Model {
    Review
  },
  schema: Schema {
    obj: {
      review: [Object],
      rating: [Object],
      createdAt: [Object],
      tour: [Object],
      user: [Object]
    },
    paths: {
      review: [SchemaString],
      rating: [SchemaNumber],
      createdAt: [SchemaDate],
      tour: [ObjectId],
      user: [ObjectId],
      _id: [ObjectId],
      __v: [SchemaNumber]
    },
    aliases: {},
    subpaths: {},
    virtuals: {
      id: [VirtualType]
    },
    singleNestedPaths: {},
    nested: {},
    inherits: {},
    callQueue: [],
    _indexes: [],
    methods: {},
    methodOptions: {},
    statics: {
      calcAverageRatings: [AsyncFunction]
    },
    tree: {
      review: [Object],
      rating: [Object],
      createdAt: [Object],
      tour: [Object],
      user: [Object],
      _id: [Object],
      __v: [Function: Number],
      id: [VirtualType]
    },
    query: {},
    childSchemas: [],
    plugins: [
      [Object],
      [Object],
      [Object],
      [Object],
      [Object]
    ],
    '$id': 3,
    s: {
      hooks: [Kareem]
    },
    _userProvidedOptions: {
      toJSON: [Object],
      toObject: [Object]
    },
    options: {
      toJSON: [Object],
      toObject: [Object],
      typePojoToMixed: true,
      typeKey: 'type',
      id: true,
      noVirtualId: false,
      _id: true,
      noId: false,
      validateBeforeSave: true,
      read: null,
      shardKey: null,
      autoIndex: null,
      minimize: true,
      discriminatorKey: '__t',
      versionKey: '__v',
      capped: false,
      bufferCommands: true,
      strict: true,
      pluralization: true
    },
    '$globalPluginsApplied': true,
    _requiredpaths: ['user', 'tour', 'rating', 'review']
  },
  op: 'findOne',
  options: {
    new: true,
    runValidators: true
  },
  _conditions: {
    _id: 5 eeff5b4045c0816a4a81f88
  },
  _fields: {},
  _update: {
    rating: '1.5678'
  },
  _path: undefined,
  _distinct: undefined,
  _collection: NodeCollection {
    collection: NativeCollection {
      collection: [Collection],
      Promise: [Function: Promise],
      _closed: false,
      opts: [Object],
      name: 'reviews',
      collectionName: 'reviews',
      conn: [NativeConnection],
      queue: [],
      buffer: false,
      emitter: [EventEmitter]
    },
    collectionName: 'reviews'
  },
  _traceFunction: undefined,
  '$useProjection': true,
  _error: null,
  reviewDoc: {
    _id: 5 eeff5b4045c0816a4a81f88,
    rating: 2.111,
    review: 'GG2.111',
    tour: {
      guides: [],
      _id: 5 eee23531daf5a7350af0e1f,
      name: 'New Test Tour',
      durationWeeks: NaN,
      id: '5eee23531daf5a7350af0e1f'
    },
    user: {
      _id: 5 c8a23c82f8fb814b56fa18d,
      name: 'Laura Wilson',
      photo: 'user-14.jpg'
    },
    createdAt: 2020 - 06 - 22 T00: 05: 08.507 Z,
    __v: 0,
    id: '5eeff5b4045c0816a4a81f88'
  }
}
