const mongoose = require('mongoose');

const URI = 'mongodb+srv://teste:teste@cluster0-d7hf9.mongodb.net/test?retryWrites=true&w=majority'

mongoose.connect(URI, {useNewUrlParser: true});

var Schema = mongoose.Schema;

var balanceSchema = new Schema({
  classifier:  String,
  description: String,
  openingBalance: Number,
  debit: Number,
  credit: Number,
  finalBalance: Number,
  parent: String
});


module.exports = {Balance: mongoose.model('Balance', balanceSchema)};