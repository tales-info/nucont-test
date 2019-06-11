# Nucont Test

Código configurável para parsear arquivos delimitados por caractere separador ou pela quantidade de caracteres.

## Comandos

`npm install`

`npm start`

`npm test`

## Exemplo de uso

```js
const transform = require('./transform')
var ts = new transform.TransformBySize('data1.txt'); //delimitado por quantidade de caracteres 

ts.addHeader('campo1', 10); // obtem o campo1 de 0 a 9.
ts.addIgnoreHeader('campo2', 5); // ignora o campo2 de 10 a 14
ts.addHeader('campo3', 5, Number); // obtem o campo3 de 15 a 19 e converte para um campo numerico.

ts.addIgnoreRowStartedWith('-'); // ignora as linhas que começarem com '-'

// aplica o parser
var parsed = ts.parse()

// se necessário, obtem os dados com a adição de um campo que define o id pai (hierarquia)
var nestedData = parsed.getNestedArrayObject('campo1')
```


```js
const transform = require('./transform')
var td = new transform.TransformByDelimiter('data2.txt'); //delimitado por quantidade de caracteres 

// em dados delimitados não é utilizado o tamanho do campo como o exemplo anterior.
td.addHeader('campo1'); // obtem o campo1 de 0 a 9.
td.addIgnoreHeader('campo2'); // ignora o campo2 de 10 a 14
td.addHeader('campo3', Number); // obtem o campo3 de 15 a 19 e converte para um campo numerico.

td.addIgnoreRowStartedWith('-'); // ignora as linhas que começarem com '-'

// aplica o parser
var parsed = td.parse()

// se necessário, obtem os dados com a adição de um campo que define o id pai (hierarquia)
var nestedData = parsed.getNestedArrayObject('campo1')
```
