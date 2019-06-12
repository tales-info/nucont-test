const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai
const transform = require('../../src/transform')
const utils = require('../../src/utils')

describe('Level 1', function() {
  const expectedOutput = JSON.parse('[{"description": "ATIVO", "classifier": "100000", "openingBalance": 1000,    "debit": 300,              "credit": 500,  "finalBalance": 1200 }, {"description": "ATIVO CIRCULANTE", "classifier": "110000", "openingBalance": 500,  "debit": 100, "credit": 200,  "finalBalance": 600 }, {"description": "DISPONIVEL", "classifier": "111000",  "openingBalance": 200,  "debit": 100, "credit": 50, "finalBalance": 150 }, {"description": "PASSIVO", "classifier": "200000",  "openingBalance": 800,  "debit": 250, "credit": 450,  "finalBalance": 1000 }]');
  
  // Copiado da teste enviado pelo contato
  const expectedOutputWithParent = JSON.parse('[{"description": "ATIVO", "classifier": "100000", "openingBalance": 1000,    "debit": 300,              "credit": 500,  "finalBalance": 1200, "parent": null }, {"description": "ATIVO CIRCULANTE", "classifier": "110000", "openingBalance": 500,  "debit": 100, "credit": 200,  "finalBalance": 600,  "parent": "100000"  }, {"description": "DISPONIVEL", "classifier": "111000",  "openingBalance": 200,  "debit": 100, "credit": 50, "finalBalance": 150,  "parent": "110000" }, {"description": "PASSIVO", "classifier": "200000",  "openingBalance": 800,  "debit": 250, "credit": 450,  "finalBalance": 1000, "parent": null }]');
  
  ts = new transform.TransformBySize('data/input1.txt')
  ts.addHeader('classifier', 8);
  ts.addHeader('description', 18);
  ts.addHeader('openingBalance', 6, Number);
  ts.addHeader('debit', 6, Number);
  ts.addHeader('credit', 6, Number);
  ts.addHeader('finalBalance', 6, Number);

  var parsed = ts.parse()
  it('parse() precisa retornar um array de objetos a partir do texto', function() {
    expect(parsed.result).to.have.deep.members(expectedOutput);
  });
  
  it('getNestedArrayObject() precisa retornar o array de objetos atualizado contendo o parent id', function() {
    expect(parsed.getNestedArrayObject('classifier')).to.have.deep.members(expectedOutputWithParent);
  });

});


describe('Level 2', function() {
  
  var ts = new transform.TransformByDelimiter('data/input2.txt');
  ts.addHeader('classifier', utils.formatClassifier);
  ts.addHeader('description');
  ts.addHeader('openingBalance', utils.formatNumber);
  ts.addHeader('debit', utils.formatNumber);
  ts.addHeader('credit', utils.formatNumber);
  ts.addHeader('finalBalance', utils.formatNumber);

  var parsed = ts.parse()
  // usa removeTrailingZeros = false.
  // se deixar como true, o parent id fica incorreto.  Usar true para valores com tamanho fixo e zero a direita. false caso contrario
  let nestedData = parsed.getNestedArrayObject('classifier', false);

  
  it('formatacao do campo moeda', function() {
    expect(utils.formatNumber('1.080.167,44C')).to.equals(1080167.44);
    expect(utils.formatNumber('1.500,00D')).to.equals(1500.00);
  });

  it('quantidade de linhas do resultado', function() {
    expect(parsed.result.length).to.equals(43);
  });
  
  it('remoção de pontos do item "classifier"', function() {
    expect(nestedData[nestedData.length - 1].classifier).to.equals('31203');
  });

  it('identificacao do parent "classifier"', function() {
    let children = parsed.result[parsed.result.length - 2].classifier;
    expect(parsed.findParentId('classifier', children, false)).to.equals('312');
    expect(parsed.findParentId('classifier', '13108', false)).to.equals('131');
  });

});