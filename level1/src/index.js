const transform = require('./transform')

var ts = new transform.TransformBySize('data/input1.txt');
ts.addHeader('classifier', 8);
ts.addHeader('description', 18);
ts.addHeader('openingBalance', 6, Number);
ts.addHeader('debit', 6, Number);
ts.addHeader('credit', 6, Number);
ts.addHeader('finalBalance', 6, Number);

var result = ts.parse().getNestedArrayObject('classifier')
console.log(result);