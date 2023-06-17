const express = require('express');
const { logger } = require('./logger');

const todoController = require('./todo-controller');

const PORT = process.env.PORT || '3000';
const app = express();

app.use(express.json());

const logFilter = function (req, res, next) {
    logger.debug('LOG_FILTER.url=' + req.url);
    next();
};

app.use(logFilter);

app.get('/', (req, res) => {
    logger.log('debug', "index page");
    res.json({
        method: req.method,
        message: 'Hello World', ...req.body
    });
});

app.get('/404', (req, res) => {
    logger.error('Not found! ' + req);
    res.sendStatus(404);
});

app.get('/user', (req, res, next) => {
    try {
        throw new Error("Invalid user");
    } catch (error) {
        logger.error(error);
        res.status(500).send("Error!");
    }
});

app.get('/todos',
    (req, res) => todoController.retrieveAllTodo(req, res)
);

app.post('/todos',
    todoController.validateForCreate,
    (req, res) => todoController.createTodo(req, res)
);

app.get('/todos/:id',
    todoController.validateId,
    (req, res) => todoController.findTodoById(req, res)
);

app.put('/todos/:id',
    todoController.validateId,
    todoController.validateForUpdate,
    (req, res) => todoController.updateTodoById(req, res)
);

app.delete('/todos/:id',
    todoController.validateId,
    (req, res) => todoController.deleteTodoById(req, res)
);

app.listen(parseInt(PORT, 10), () => {
    logger.info(`Listening on http://localhost:${PORT}`);
});
