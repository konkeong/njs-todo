const { Sequelize, DataTypes } = require('sequelize');

const { logger } = require('../../logger');
const sequelize = require("../../config/db");

const Todo = sequelize.define('Todo',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(48),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(248),
            allowNull: true,
        },
        completed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: false,
        tableName: 't_todo',
    }
);

Todo.sync()
    .then(() => { logger.info("Sync TODO successfully"); })
    .catch((err) => { throw err; });

/*
Todo.findAll().then((rows) => {
    console.log(rows);
}).catch((err) => { console.log(err); });
 */

module.exports = Todo;
