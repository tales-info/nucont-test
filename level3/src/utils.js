const fs = require('fs');

/**
 * Abre o arquivo e retorna seu conteúdo em formato de string
 * @param {String} filename nome/caminho do arquivo a ser lido
 * @returns {String} conteúdo do arquivo
 */
const readFileToText = (filename) => {
    try {
        return fs.readFileSync(filename).toString()
    } catch (error) {
        console.error('Erro ao ler o arquivo: ' + error)   
    }
}

/**
 * Remove os zeros a direita
 * @param {String} value string a retornar sem os zeros a direita
 * @returns {String} retorna a string limpa
 */
const trailingZeros = (value) => {
    try {
        return value.replace(/0+$/g, "");    
    } catch (error) {
        console.error('trailing zeros error:', error)
    }
}


const formatNumber = (value) => Number(value.replace(/[\.CD]*/g, '').replace(',', '.'));

const formatClassifier = (value) => value.split('.').join('');

module.exports = {readFileToText, trailingZeros, formatClassifier, formatNumber}