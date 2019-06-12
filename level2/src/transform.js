const utils = require('./utils')

/**
 * Classe Base da transformação
 */
class Transform {
    /**
     * Construtor base das classes de transformacao
     * @param {String} filename nome do arquivo que terá seu conteudo carregado
     * @param {String} rowDelimiter Delimitador de linha (normalmente '\r\n' para windows e '\n' para linux)
     */
    constructor(filename, rowDelimiter = '\r\n') {
        this.rows = []
        this.headers = {}
        if (filename) {
            // se arquivo existir, carrega e seta as linhas do arquivo na variavel rows, elminando linhas em branco
            var content = utils.readFileToText(filename);
            this.rows = content.split(rowDelimiter).filter(i => i.trim() !== '');
        }
    }

    addHeader() {
        throw Exception('not yet implemented')
    }

    parse() {
        throw Exception('not yet implemented')
    }
}

/**
 * Classe para transformação delimitado por quantidade de espaços.
 */
class TransformBySize extends Transform {

    /**
     * Adiciona campo no resultado
     * @param {String} name nome do cabecalho que será atribuido como chave
     * @param {Number} size tamanho que sera usado para delimitar este campo
     * @param {Function} callback callback usado para formatar o valor do campo
     */
    addHeader(name, size, callback = undefined) {
        this.headers[name] = { size, callback };
    }

    /**
     * Converte o texto de cada linha em objeto
     * @returns {ResultArrayObject} retorna um objeto com o resultado da conversão
     */
    parse() {
        try {
            // quebra a string pelo delimitador
            const lines = this.rows.map(line => {
                let start = 0;
                let result = {};
                // percorre o headers a fim de obter o valor de cada item do mesmo
                Object.keys(this.headers).forEach(v => {
                    if (this.headers[v].size) {
                        result[v] = line.substring(start, start + this.headers[v].size).trim();
                        // converte para o tipo
                        if (this.headers[v].callback) {
                            result[v] = this.headers[v].callback(result[v])
                        }
                        start += this.headers[v].size;
                    } else {
                        result[v] = null;
                    }
                })
                return result;
            });
            return new ResultArrayObject(lines);
        } catch (error) {
            console.error('erro ao converter o texto: ' + error)
        }
    }
}




/**
 * Classe para transformação delimitado por tabs.
 */
class TransformByDelimiter extends Transform {

    constructor(filename, columnDelimiter = '\t', rowDelimiter = '\r\n') {
        super(filename, rowDelimiter);
        this.columnDelimiter = columnDelimiter;
    }
    
    /**
     * Adiciona campo no resultado
     * @param {String} name nome do cabecalho que será atribuido como chave
     * @param {Number} size tamanho que sera usado para delimitar este campo
     * @param {Function} callback callback usado para formatar o valor do campo
     */
    addHeader(name, callback = undefined) {
        this.headers[name] = { callback };
    }

    /**
     * Converte o texto de cada linha em objeto
     * @returns {ResultArrayObject} retorna um objeto com o resultado da conversão
     */
    parse() {
        try {
            // quebra a string pelo delimitador
            const lines = this.rows.map(line => {
                let result = {};
                let columns = line.split(this.columnDelimiter).filter(i => i.trim() != '');
                Object.keys(this.headers).forEach((v, i) => {
                    if (columns.length > i) {
                        result[v] = columns[i].trim();
                        if (this.headers[v].callback) {
                            result[v] = this.headers[v].callback(result[v]);
                        }
                    } else {
                        result[v] = null;
                    }
                });
                return result;
            });
            return new ResultArrayObject(lines);
        } catch (error) {
            console.error('erro ao converter o texto: ' + error)
        }
    }
}



/**
 * Resultado das transformacoes 
 */
class ResultArrayObject {

    /**
     * Construtor que seta o resultado do metodo parse das classes derivadas de Transform
     * @param {Array} data resultado da conversão das linhas em objetos
     */
    constructor(data) {
        this._data = data;
    }

    /**
     * retorna os dados resultantes de cada processo de transformação
     * @returns {Array} resultado das transformacoes
     */
    get result() {
        return this._data;
    }

    /**
     * Encontra o item pai
     * @param {string} nestedKey key que será usada para encontrar o item pai
     * @param {string} value valor a ser comparado
     * @returns {String} id do item pai
     */
    findParentId(nestedKey, value) {
        try {
            var parentId = null;
            var parentKey = null;
            let key = utils.trailingZeros(value);
            this._data.forEach(i => {
                if (i[nestedKey]) {
                    let currentKey = utils.trailingZeros(i[nestedKey]);
                    // se a chave que está sendo comparada (current) tiver tamanho menor que a chave filha 
                    // e a chave filha iniciar com com a chave que está sendo comparada
                    if (key.length > currentKey.length && key.startsWith(currentKey)) {
                        // se a chave pai nao tiver sido setada ou a chave atual for maior que a ultima encontrada, substitui!
                        if (parentId == null || currentKey.length > parentKey.length) {
                            parentId = i[nestedKey];
                            parentKey = currentKey;
                        }
                    }
                }
            })
            return parentId;
        } catch (error) {
            console.error('erro ao buscar o parent id: ' + error)
        }
    }

    /**
     * Seta o parentId em cada item
     * @param {String} nestedKey key que será usada para encontrar o item pai
     * @param {String} parentKey key onde será armazenado o parentId
     * @returns {ResultArrayObject} retorna o mesmo objeto this, onde novos metodos podem ser aplicados em sequencia
     */
    getNestedArrayObject(nestedKey, parentKey = 'parent') {
        try {
            // para cada item, acrescenta o parentId encontrado
            return this._data.map(item => ({
                ...item,
                [parentKey]: this.findParentId(nestedKey, item[nestedKey])
            }));
        } catch (error) {
            console.error('erro ao inserir o parent id: ' + error)
        }
    }
}


module.exports = { TransformBySize, TransformByDelimiter }