const { loggerTodo } = require('./logger');
const TodoModel = require('./db/models/todo');

/*
 * This is similar to Spring Service layer.
 */

const findAllItems = async function () {
    let lcn = 0;
    let errMsg = 'Fail to retrieve listing of TODO.';
    let todos = [];
    try {
        todos = await TodoModel.findAll();
        lcn = 1;
        errMsg = `Total item(s) = ${todos.length}.`;
    } catch (err) {
        lcn = 0;
        loggerTodo.error('fail to retrieve all ' + err);
    }
    return {
        'serviceCode': lcn,
        'serviceMessage': errMsg,
        'serviceResult': todos,
    };
};

const findItemById = async function (todoId) {
    let lcn = 0;
    let errMsg = 'Fail to retrieve TODO by "id".';
    let todo = {};
    try {
        todo = await TodoModel.findByPk(todoId);
        if (todo) {
            lcn = 1;
            errMsg = `TODO.id=[${todo.id}] found.`;
        } else {
            lcn = 2;
            errMsg = 'Item not found.';
        }
    } catch (err) {
        lcn = 0;
        loggerTodo.error('fail to retrieveById id=[' + todoId + '] ' + err);
    }
    return {
        'serviceCode': lcn,
        'serviceMessage': errMsg,
        'serviceResult': todo,
    };
};

const createItem = async function (todoDto) {
    let lcn = 0;
    let errMsg = 'Fail to create TODO.';
    let todo = {};
    try {
        todo = await TodoModel.create({
            title: todoDto.title,
            description: todoDto.description,
        });
        if (todo) {
            lcn = 1;
            errMsg = `TODO.id=[${todo.id}] created.`;
            loggerTodo.debug(errMsg);
        } else {
            lcn = 2;
            errMsg = 'Item not created.';
        }
    } catch (err) {
        lcn = 0;
        loggerTodo.error('fail to createTodo' + err);
    }
    return {
        'serviceCode': lcn,
        'serviceMessage': errMsg,
        'serviceResult': todo,
    };
};

const deleteItemById = async function (todoId) {
    let lcn = 0;
    let errMsg = 'Fail to delete TODO by "id".';
    let todo = {};
    try {
        todo = await TodoModel.findByPk(todoId);
        if (todo) {
            await todo.destroy();
            lcn = 1;
            errMsg = `TODO.id=[${todo.id}] deleted.`;
        } else {
            lcn = 2;
            errMsg = 'Item not found.';
        }
    } catch (err) {
        lcn = 0;
        loggerTodo.error('fail to deleteById id=[' + todoId + '] ' + err);
    }
    return {
        'serviceCode': lcn,
        'serviceMessage': errMsg,
        'serviceResult': todo,
    };
};

const updateItem = async function (todoDto) {
    let lcn = 0;
    let errMsg = 'Fail to update TODO.';
    const todoId = todoDto.id;
    let todo = {};
    try {
        todo = await TodoModel.findByPk(todoId);
        if (todo) {
            // check if need to update the record or not
            let nField = 0;
            let changeSets = {};

            if (todoDto.title !== null && todo.title !== todoDto.title) {
                changeSets.title = todoDto.title;
                nField += 1;
            }
            if (todoDto.description !== null && todo.description !== todoDto.description) {
                changeSets.description = todoDto.description;
                nField += 1;
            }
            if (todoDto.completed !== null && todo.completed !== todoDto.completed) {
                changeSets.completed = todoDto.completed;
                nField += 1;
            }

            if (nField == 0) {
                lcn = 3;
                errMsg = 'Item is not updated, because input has no differences.';
                loggerTodo.debug(errMsg);
            } else {
                todo = await todo.update(changeSets);
                lcn = 1;
                errMsg = 'Item is updated.';
            }
        } else {
            lcn = 2;
            errMsg = 'Item not found.';
        }
    } catch (err) {
        lcn = 0;
        loggerTodo.error('fail to updateTodo ' + todoDto + ' :: ' + err);
    }
    return {
        'serviceCode': lcn,
        'serviceMessage': errMsg,
        'serviceResult': todo,
    };
};

module.exports = {
    findAllItems,
    findItemById,
    createItem,
    deleteItemById,
    updateItem,
};
