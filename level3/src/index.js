const transform = require('./transform')
const utils = require('./utils')


var td = new transform.TransformByDelimiter('data/input3.txt');
td.addHeader('classifier', utils.formatClassifier);
td.addHeader('description');
td.addHeader('openingBalance', utils.formatNumber);
td.addIgnoreHeader('letra');
td.addHeader('debit', utils.formatNumber);
td.addHeader('credit', utils.formatNumber);
td.addHeader('finalBalance', utils.formatNumber);

td.addIgnoreRowStartedWith('Balancete Contábil'); // o mesmo que td.addIgnoreRowByIndex(0) neste caso
td.addIgnoreRowStartedWith('Empresa:'); // o mesmo que td.addIgnoreRowByIndex(1) neste caso
td.addIgnoreRowStartedWith('Período:'); // o mesmo que td.addIgnoreRowByIndex(2) neste caso
td.addIgnoreRowStartedWith('Conta'); // o mesmo que td.addIgnoreRowByIndex(3) neste caso

var result = td.parse().getNestedArrayObject('classifier', false)
console.dir(result);