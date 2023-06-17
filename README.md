# njs-todo
Force TODO (nodejs+expressjs+sequelizejs) application to behave like Spring MVC

1. After clone the project, install/update/pull the [Nodejs](https://nodejs.org/en) dependencies

```
npm install
```

2. Initialize the in-memory [SQLite3](https://www.sqlite.org/index.html) database, and seed some records.

```
node init-todo-table.js
```

3. Start the REST API server.

```
npm run app
```

4. Optionally import the [Postman](https://www.postman.com/) collection "nodejs-todo.postman_collection".

5. `todo-controller.js` is roughly correspond to Spring `Controller`.

6. `todo-service.js` is roughly correspond to Spring `Service`.
