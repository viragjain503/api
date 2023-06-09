const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config()

const port = process.env.PORT || 5000

const articleRoute = require('./routes/article')
const tagsRoute = require('./routes/tags')

//routes
app.use('/article',articleRoute);
app.use('/tags',tagsRoute);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(cors());

// for database connection
mongoose.connect(process.env.DATABASE);

// for database connection error
mongoose.connection.on("error", err => {
  console.log("err", err)
})

// for database connection successfull
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
})

app.get("/",(req,res)=>{
    res.send([{message: "Hi iam live"}]);
})

app.listen(port, ()=>{
    console.log(`I am live on PORT: ${port}`)
})

