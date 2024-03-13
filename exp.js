const { MongoClient } = require("mongodb");
const user = "temp";
const password = "temp";
const mongoURI = `mongodb+srv://${user}:${password}@jwmdb.u5a8uns.mongodb.net/?retryWrites=true&w=majority&appName=jwmdb`;
const express = require('express');
const cookieParser = require('cookie-parser');
const mongodb = require('mongodb');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const dbName = 'cmps415';
const collectionName = 'EXP-MONGO';

mongodb.MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        app.get('/', (req, res) => {
            const authCookie = req.cookies.auth;
            if (!authCookie) {
                res.send(`
                    <h1>Login or Register</h1>
                    <form action="/login" method="post">
                        <label for="userID">User ID:</label>
                        <input type="text" id="userID" name="userID" required>
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                        <button type="submit">Login</button>
                    </form>
                    <form action="/register" method="post">
                        <label for="userID">User ID:</label>
                        <input type="text" id="userID" name="userID" required>
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                        <button type="submit">Register</button>
                    </form>
                    <a href="/cookies">View Active Cookies</a>
                `);
            } else {
                res.send(`
                    <h1>Authenticated</h1>
                    <p>Authentication Cookie: ${authCookie}</p>
                    <a href="/cookies">View Active Cookies</a>
                `);
            }
        });

        app.post('/login', (req, res) => {
            const { userID, password } = req.body;
            collection.findOne({ userID, password })
                .then(user => {
                    if (user) {
                        res.cookie('auth', 'authentication_cookie', { maxAge: 60000 }); // Expires in 1 minute
                        res.redirect('/');
                    } else {
                        res.send(`
                            <h2>Invalid Credentials</h2>
                            <a href="/">Back to Login</a>
                        `);
                    }
                })
                .catch(error => console.error(error));
        });

        app.post('/register', (req, res) => {
            const { userID, password } = req.body;
            collection.insertOne({ userID, password })
                .then(result => {
                    res.send(`
                        <h2>Registration Successful</h2>
                        <a href="/">Login</a>
                    `);
                })
                .catch(error => console.error(error));
        });

    app.get('/cookies', (req, res) => {
      const authCookie = req.cookies.auth;
      const cookieMessage = authCookie ? `Cookie: ${authCookie}` : 'No cookies';
      let links = '';
      if (authCookie) {
        links = `
            <a href="/clear-cookies">Clear Cookies</a>
        `;
      }
      res.send(`
          <h2>Active Cookies</h2>
          <p>${cookieMessage}</p>
          ${links}
          <a href="/">Back to Home</a>
      `);
    });

        app.get('/clear-cookies', (req, res) => {
            res.clearCookie('auth');
            res.send(`
                <h2>Cookies Cleared</h2>
                <a href="/cookies">View Active Cookies</a>
                <a href="/">Back to Home</a>
            `);
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        const port = 3000;
        console.log('Server started at http://localhost:' + port);

    })
    .catch(error => console.error(error));