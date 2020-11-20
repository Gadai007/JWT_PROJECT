const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter')
const cookieParser = require('cookie-parser')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')
const app = express();
require('dotenv').config()

// middleware
app.use(express.urlencoded({ extended: false}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'));

// view engine
app.set('view engine', 'ejs');

// database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000, () => {
    console.log('server started on port 3000')
  }))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('home'));
app.use('/', authRouter)
app.get('/smoothies', requireAuth,  (req, res) => res.render('smoothies'));