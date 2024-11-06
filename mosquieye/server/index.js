//mongodb+srv://muhdnik12:<db_password>@cluster0.2pwcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

const express = require('express');
const connectDB = require('./db.js');
const itemModel = require('./models/item.js');

const app = express();

connectDB();

app.listen(3000, () => {
    console.log('App is running');
});