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