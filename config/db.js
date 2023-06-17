const { Sequelize } = require('sequelize');
const { loggerSql } = require('../logger');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database.sqlite',
    logging: msg => loggerSql.debug(msg)
});

async function testConnectivity() {
    try {
        await sequelize.authenticate();
        loggerSql.debug('Connection has been established successfully.');
    } catch (error) {
        loggerSql.error('Unable to connect to the database:', error);
        return;
    }
    try {
        await sequelize.close();
        loggerSql.debug('Connection is closed.');
    } catch (error) {
        loggerSql.error('Unable to close database:', error);
    }
}

module.exports = sequelize