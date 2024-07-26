const { createLogger, transports, format } = require('winston');
const path = require('path');

// Crie um logger
const logger = createLogger({
    level: 'info', // Nível de log padrão
    format: format.combine(
        format.timestamp(), // Adiciona um carimbo de data/hora aos logs
        format.json(), // Formato JSON para os logs
        format.printf(info => {
            const { timestamp, level, message, label } = info;
            const fileName = label || 'unknown'; // Se não houver label, use 'unknown'
            return `${timestamp} [${level.toUpperCase()}] (${fileName}): ${message}`;
        })
    ),
    transports: [
        new transports.Console(), // Saída para o console
        new transports.File({ filename: 'error.log', level: 'error' }) // Saída para um arquivo
    ]
});


module.exports = logger;
