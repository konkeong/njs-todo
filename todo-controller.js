const { loggerTodo } = require('./logger');
const todoService = require('./todo-service');

/*
 * This is similar to Spring Controller layer.
 * Inject/Autowire with Repository and Service.
 * Validation are implemented as Middleware functions, chain-able.
 * https://blog.bitsrc.io/5-common-mistakes-in-using-promises-bfcc4d62657f
 * https://restfulapi.net/http-methods/
 */

function checkValueExist(value) {
    if (value === undefined) {
        return { 'success': false, 'message': 'is undefined' };
    }
    return { 'success': true, 'message': '' };
}

function checkStringNotBlank(value) {
    if (value === undefined) {
        return { 'success': false, 'message': 'missing' };
    }
    if (typeof value !== 'string') {
        return { 'success': true, 'message': 'not string', 'value': value };
    }
    value = value.trim();
    if (value === '') {
        return { 'success': false, 'message': 'is blank' };
    }
    return { 'success': true, 'message': '', 'value': value };
}

function checkStringAllowBlank(value) {
    if (value === undefined) {
        return { 'success': false, 'message': 'missing' };
    }
    if (typeof value !== 'string') {
        return { 'success': true, 'message': 'not string', 'value': value };
    }
    value = value.trim();
    return { 'success': true, 'message': '', 'value': value };
}

function checkStringMaxLength(value, maxLength) {
    if (value === undefined) {
        return { 'success': false, 'message': 'missing' };
    }
    if (typeof value !== 'string') {
        return { 'success': true, 'message': 'not string', 'value': value };
    }
    if (value.length > maxLength) {
        return { 'success': false, 'message': 'exceed maxLength=[' + maxLength + ']', 'value': value };
    }
    return { 'success': true, 'message': '', 'value': value };
}

function checkNumberPositive(value) {
    if (value === undefined) {
        return { 'success': false, 'message': 'missing' };
    }
    let ival = Number(value);
    if (isNaN(ival)) {
        return { 'success': false, 'message': 'not a number' };
    }
    if (ival <= 0) {
        return { 'success': false, 'message': 'must > 0' };
    }
    return { 'success': true, 'message': '', 'value': ival };
}

function checkForTodoId(todoId) {
    let vald = checkValueExist(todoId);
    if (! vald.success) {
        return vald;
    }
    vald = checkNumberPositive(todoId)
    if (! vald.success) {
        return vald;
    }
    return vald;
}

function checkForTodoTitle(todoTitle, notBlank) {
    let vald = checkValueExist(todoTitle);
    if (! vald.success) {
        if (notBlank) {
            return vald;
        }
        vald.success = true;
        vald.value = null;
        return vald;
    }
    if (notBlank) {
        vald = checkStringNotBlank(todoTitle);
        if (! vald.success) {
            return vald;
        }
        todoTitle = vald.value;
        vald = checkStringMaxLength(todoTitle, 48);
        if (! vald.success) {
            return vald;
        }
    } else {
        vald = checkStringAllowBlank(todoTitle);
        if (! vald.success) {
            return vald;
        }
    }
    return vald;
}

function checkForTodoDescription(todoDescription) {
    let vald = checkValueExist(todoDescription);
    if (! vald.success) {
        vald.success = true;
        vald.value = null;
        return vald;
    }
    vald = checkStringAllowBlank(todoDescription);
    if (! vald.success) {
        return vald;
    }
    todoDescription = vald.value;
    vald = checkStringMaxLength(todoDescription, 248);
    if (! vald.success) {
        return vald;
    }
    return vald;
}

function checkForTodoCompleted(todoCompleted) {
    let vald = checkValueExist(todoCompleted);
    if (! vald.success) {
        vald.success = true;
        vald.value = null;
        return vald;
    }
    vald.success = true;
    vald.value = null;
    if (typeof todoCompleted === 'boolean') {
        vald.value = todoCompleted;
    }
    if (typeof todoCompleted === 'string') {
        if (todoCompleted.toLowerCase() === 'true') {
            vald.value = true;
        }
        if (todoCompleted.toLowerCase() === 'false') {
            vald.value = false;
        }
    }
    return vald;
}

const validateId = (req, res, next) => {
    if (req.validated === undefined) {
        req.validated = {};
    }

    let vald = checkForTodoId(req.params.id);
    if (! vald.success) {
        res.status(400).json({
            "error_code": 1001,
            "message": `"id" ${vald.message}`
        });
        return;
    }
    req.validated.id = vald.value;

    next();
};

const validateForCreate = (req, res, next) => {
    if (req.validated === undefined) {
        req.validated = {};
    }

    const { title, description } = req.body;

    // title is required
    let vald = checkForTodoTitle(title, true);
    if (! vald.success) {
        res.status(400).json({
            "error_code": 1001,
            "message": `"title" ${vald.message}`
        });
        return;
    }
    req.validated.title = vald.value;

    // description is optional
    vald = checkForTodoDescription(description);
    if (! vald.success) {
        res.status(400).json({
            "error_code": 1001,
            "message": `"description" ${vald.message}`
        });
        return;
    }
    req.validated.description = vald.value;

    next();
};

const validateForUpdate = (req, res, next) => {
    if (req.validated === undefined) {
        req.validated = {};
    }

    const { title, description, completed } = req.body;
    // everything are not required, but must have at least one element

    let vald = checkForTodoTitle(title, false);
    if (! vald.success) {
        res.status(400).json({
            "error_code": 1001,
            "message": `"title" ${vald.message}`
        });
        return;
    }
    req.validated.title = vald.value;

    vald = checkForTodoDescription(description);
    if (! vald.success) {
        res.status(400).json({
            "error_code": 1001,
            "message": `"description" ${vald.message}`
        });
        return;
    }
    req.validated.description = vald.value;

    vald = checkForTodoCompleted(completed);
    if (! vald.success) {
        res.status(400).json({
            "error_code": 1001,
            "message": `"completed" ${vald.message}`
        });
        return;
    }
    req.validated.completed = vald.value;

    if (req.validated.title === null &&
        req.validated.description === null &&
        req.validated.completed === null) {
        res.status(400).json({
            "error_code": 1001,
            "message": "nothing valid from input values to update"
        });
        return
    }

    next();
};

const retrieveAllTodo = (req, res) => {
    (async() => {
        const parentErrorCode = 1100;
        const serviceResult = await todoService.findAllItems();
        if (serviceResult.serviceCode == 1) {
            res.status(200).json(
                serviceResult.serviceResult
            );
        } else {
            res.status(500).json({
                "error_code": parentErrorCode + 51,
                "message": serviceResult.serviceMessage
            });
        }
    })();
};

const findTodoById = (req, res) => {
    const todoDto = req.validated;
    const todoId = todoDto.id;
    loggerTodo.debug('todoId=[' + todoId + ']');
    (async() => {
        const parentErrorCode = 1100;
        const serviceResult = await todoService.findItemById(todoId);
        if (serviceResult.serviceCode == 1) {
            res.status(200).json(
                serviceResult.serviceResult
            );
        } else if (serviceResult.serviceCode == 2) {
            res.status(404).json({
                "error_code": parentErrorCode + 1,
                "message": serviceResult.serviceMessage
            });
        } else {
            res.status(500).json({
                "error_code": parentErrorCode + 51,
                "message": serviceResult.serviceMessage
            });
        }
    })();
};

const createTodo = (req, res) => {
    const todoDto = req.validated;
    loggerTodo.debug('dto=[' + JSON.stringify(todoDto) + ']');
    (async() => {
        const parentErrorCode = 1200;
        const serviceResult = await todoService.createItem(todoDto);
        if (serviceResult.serviceCode == 1) {
            // created
            res.status(201).json(
                serviceResult.serviceResult
            );
        } else if (serviceResult.serviceCode == 2) {
            // cannot create item, possibly DB issue: unique key conflict, non null
            res.status(500).json({
                "error_code": parentErrorCode + 1,
                "message": serviceResult.serviceMessage
            });
        } else {
            res.status(500).json({
                "error_code": parentErrorCode + 51,
                "message": serviceResult.serviceMessage
            });
        }
    })();
};

const deleteTodoById = (req, res) => {
    const todoDto = req.validated;
    const todoId = todoDto.id;
    loggerTodo.debug('todoId=[' + todoId + ']');
    (async() => {
        const parentErrorCode = 1300;
        const serviceResult = await todoService.deleteItemById(todoId);
        if (serviceResult.serviceCode == 1) {
            // delete sucessfully and return deleted item
            res.status(200).json(
                serviceResult.serviceResult
            );
        } else if (serviceResult.serviceCode == 2) {
            // not record found
            res.status(404).json({
                "error_code": parentErrorCode + 1,
                "message": serviceResult.serviceMessage
            });
        } else {
            res.status(500).json({
                "error_code": parentErrorCode + 51,
                "message": serviceResult.serviceMessage
            });
        }
    })();
};

const updateTodoById = (req, res) => {
    const todoDto = req.validated;
    loggerTodo.debug('dto=[' + JSON.stringify(todoDto) + ']');
    (async() => {
        const parentErrorCode = 1400;
        const serviceResult = await todoService.updateItem(todoDto);
        if (serviceResult.serviceCode == 1) {
            // update successully
            res.status(200).json(
                serviceResult.serviceResult
            );
        } else if (serviceResult.serviceCode == 2) {
            // no record found
            res.status(404).json({
                "error_code": parentErrorCode + 1,
                "message": serviceResult.serviceMessage
            });
        } else if (serviceResult.serviceCode == 3) {
            // nothing was updated
            loggerTodo.debug('no values changed');
            res.status(200).json(
                serviceResult.serviceResult
            );
        } else {
            res.status(500).json({
                "error_code": parentErrorCode + 51,
                "message": serviceResult.serviceMessage
            });
        }
    })();
};

module.exports = {
    validateId,
    validateForCreate,
    validateForUpdate,
    retrieveAllTodo,
    findTodoById,
    createTodo,
    deleteTodoById,
    updateTodoById,
};
