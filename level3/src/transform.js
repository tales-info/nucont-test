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
    constructor(filename=undefined, rowDelimiter = '\r\n') {
        this.rows = []
        this.ignoredRowsByIndex = []
        this.ignoredRowsStartedWith = []
        this.ignoreRowCallback = undefined;
        this.headers = {}
        this.rowDelimiter = rowDelimiter;
        if (filename) {
            // se arquivo existir, carrega e seta as linhas do arquivo na variavel rows, elminando linhas em branco
            var content = utils.readFileToText(filename);
            this.setContent(content);
        }
    }

    setContent(content) {
        this.rows = content.split(this.rowDelimiter).filter(i => i.trim() !== '');
    }

    /**
     * Adiciona cabecalho (implementado nas classes derivadas)
     */
    addHeader() {
        throw Exception('not yet implemented')
    }

    /**
     * Retorna o array de objetos convertidos (implementado nas classes derivadas)
     */
    parse() {
        throw Exception('not yet implemented')
    }

    /**
     * Ignora o campo no resultado
     * @param {String} name Ignora a coluna (as colunas são ignoradas/adicionadas na ordem que os metodos sao chamados)
     */
    addIgnoreHeader(name) {
        this.headers[name] = { ignore: true }
    }

    /**
     * Ignora de acordo com a callback
     * @param {String} name callback que será executada no momento da verificacao da linha. a calback recebe o valor da linha
     */
    addIgnoreRowCallback(callback) {
        this.ignoreRowCallback = callback;
    }

    /**
     * adiciona o indice da linha para ignoarar e não ser retornada pela propriedade validRows
     * @param {Number} index indice da linha a ser ignorada
     */
    addIgnoreRowByIndex(index) {
        this.ignoredRowsByIndex.push(index);
    }

    /**
     * adiciona texto a ser ignorado caso o texto da linha comece com ele e não ser retornada pela propriedade validRows
     * @param {String} text texto a ser verificado em cada linha
     */
    addIgnoreRowStartedWith(text) {
        this.ignoredRowsStartedWith.push(text);
    }

    /**
     * Propriedade que retorna as linhas válidas. ou seja, as que não foram marcadas para serem ignoradas
     * @returns {Array} retorna um array de strings validas
     */
    get validRows() {
        return this.rows.filter((v1, i1) => (this.ignoreRowCallback ? !this.ignoreRowCallback(v1) : true) && this.ignoredRowsByIndex.indexOf(i1) === -1 && !this.ignoredRowsStartedWith.some(v2 => v1.startsWith(v2)));
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
     * Ignora o campo no resultado
     * @param {String} name Ignora a coluna (as colunas são ignoradas/adicionadas na ordem que os metodos sao chamados)
     */
    addIgnoreHeader(name, size) {
        this.headers[name] = { ignore: true, size }
    }

    /**
     * Converte o texto de cada linha em objeto
     * @returns {ResultArrayObject} retorna um objeto com o resultado da conversão
     */
    parse() {
        try {
            // quebra a string pelo delimitador
            const lines = this.validRows.map(line => {
                let start = 0;
                let result = {};
                // percorre o headers a fim de obter o valor de cada item do mesmo
                Object.keys(this.headers).forEach(v => {
                    if (this.headers[v].ignore) {
                        if (this.headers[v].size) {
                            start += this.headers[v].size;
                        }
                        return;
                    }
                    if (this.headers[v].size) {
                        result[v] = line.substring(start, start + this.headers[v].size).trim();
                        // formata usando a callback do cabecalho atual
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

    constructor(filename=undefined, columnDelimiter = '\t', rowDelimiter = '\r\n') {
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
            const lines = this.validRows.map(line => {
                let result = {};
                let columns = line.split(this.columnDelimiter).filter(i => i.trim() != '');
                Object.keys(this.headers).forEach((v, i) => {
                    if (this.headers[v].ignore) {
                        return;
                    }
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
     * @param {bool} removeTrailingZeros remove os zeros a direita. Usar true para valores com tamanho fixo e zeros a direita. false caso contrario
     * @returns {String} id do item pai
     */
    findParentId(nestedKey, value, removeTrailingZeros = true) {
        try {
            var parentId = null;
            var parentKey = null;
            // remove os zeros do final da string
            let key = removeTrailingZeros ? utils.trailingZeros(value) : value;
            this._data.forEach(i => {
                if (i[nestedKey]) {
                    let currentKey = removeTrailingZeros ? utils.trailingZeros(i[nestedKey]) : i[nestedKey];
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
    getNestedArrayObject(nestedKey, removeTrailingZeros = true, parentKey = 'parent') {
        try {
            // para cada item, acrescenta o parentId encontrado
            return this._data.map(item => ({
                ...item,
                [parentKey]: this.findParentId(nestedKey, item[nestedKey], removeTrailingZeros)
            }));
        } catch (error) {
            console.error('erro ao inserir o parent id: ' + error)
        }
    }
}


module.exports = { TransformBySize, TransformByDelimiter }