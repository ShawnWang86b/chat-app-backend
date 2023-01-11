### chat-app-backend

#### npm Package used

1. mongoose
2. [dotenv](https://www.npmjs.com/package/dotenv)
3. [nodemon](https://www.npmjs.com/package/nodemon)
4. [colors](https://www.npmjs.com/package/colors)
5. [express-async-handler](https://www.npmjs.com/package/express-async-handler)\
   Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
6. [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)\
   An implementation of JSON Web Tokens.
7. [socket.io server](https://socket.io/docs/v4/server-installation/)
8. cors

### Getting Started

**Create .env File**.\
PORT = `5000`.

MONGO_URL = ''.\
To get MONGO_URL, navigate `MongoDB Atlas`, create a cluster, create a user, click Connect then click `Connect your application`.\
MONGO_URL like this: `mongodb+srv://shawn:<password>@cluster0.qqehrpi.mongodb.net/?retryWrites=true&w=majority`.\
replace shawn as your user name, then replace `<password>` by your own password

JWT_SECRET = "add a string Anything you want".\
For example: `JWT_SECRET ="shawn"`

**Change deployed URL to localhost**.\
For deploy reason, some parts URL changed from `http://localhost` to deployed website, if you want test in local, need to change back.\
in `server.js`, comment the https://shawns-chat-app-frontend.onrender.com, then uncomment http://localhost:3000 like this:

```js
//socket io
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "http://localhost:3000",
      //"https://shawns-chat-app-frontend.onrender.com",
    ],
    // credentials: true,
  },
});
```

in `config` folder, `allowedOrigins.js`, add localhost as this:

```js
const allowedOrigins = [
  "http://localhost:3000",
  "https://shawns-chat-app-frontend.onrender.com",
];

module.exports = allowedOrigins;
```

**Installation**.\
`npm i`

**Start the program**.\
`npm run start`
