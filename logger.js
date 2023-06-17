const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const logger = createLogger({
    level: 'debug',
    format: format.json(),
    transports: [new transports.Console()],
});

const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] [${level.toUpperCase()}]: ${message}`;
});

const loggerTodo = createLogger({
    level: "debug",
    format: combine(label({ label: "TODO" }), timestamp(), customFormat),
    transports: [new transports.Console()],
});

const loggerSql = createLogger({
    level: "debug",
    format: combine(label({ label: "SQL" }), timestamp(), customFormat),
    transports: [new transports.Console()],
});

module.exports = { logger, loggerTodo, loggerSql };
