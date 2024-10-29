const mongoose = require('mongoose');
require('dotenv').config();

const password = process.env.PASSWORD;
const connectionUrl = `mongodb+srv://2100031817:${password}@cluster0.bwj1o.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);
mongoose.connect(connectionUrl)
  .then(() => {
    console.log('Connection has been established');
  })
  .catch(error => {
    console.log('Error establishing connection:', error);
    process.exit(1); 
  });


