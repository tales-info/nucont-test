const transform = require('./transform')
const utils = require('./utils')
const {Balance} = require('./mongo');


var ts = new transform.TransformBySize('data/input4.txt');
ts.addIgnoreHeader('acesso', 7);
ts.addHeader('classifier', 16, utils.formatClassifier);
ts.addHeader('description', 41);
ts.addIgnoreHeader('c_custo', 8);
ts.addHeader('openingBalance', 15, utils.formatNumber);
ts.addHeader('debit', 15, utils.formatNumber);
ts.addHeader('credit', 15, utils.formatNumber);
ts.addHeader('finalBalance', 15, utils.formatNumber);

ts.addIgnoreRowStartedWith('Balancete Analitico');
ts.addIgnoreRowStartedWith('-');
ts.addIgnoreRowStartedWith('CNPJ/CPF:');
ts.addIgnoreRowStartedWith('End:');
ts.addIgnoreRowStartedWith('Municipio:');
ts.addIgnoreRowStartedWith('Periodo:');
ts.addIgnoreRowStartedWith('Acesso Classificador');
ts.addIgnoreRowStartedWith('TESLA, INC');
// ts.addIgnoreRowCallback((value) => value.startsWith('2') ? true : false) // neste exemplo as linhas que começam com '2' são ignoradas


var result = ts.parse().getNestedArrayObject('classifier')
console.dir(result);

Balance.insertMany(result, (err) => {
    if (err) console.log(err);
    console.log('dados salvos com sucesso!')
    process.exit(0);
})