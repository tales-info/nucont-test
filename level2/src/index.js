const transform = require('./transform')
const utils = require('./utils')

var td = new transform.TransformByDelimiter('data/input2.txt');
td.addHeader('classifier', utils.formatClassifier);
td.addHeader('description');
td.addHeader('openingBalance', utils.formatNumber);
td.addHeader('debit', utils.formatNumber);
td.addHeader('credit', utils.formatNumber);
td.addHeader('finalBalance', utils.formatNumber);

var result = td.parse().getNestedArrayObject('classifier')
console.log(result);