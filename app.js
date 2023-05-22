const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(2424, () => {
      console.log("Server Running at http://localhost:2424/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// GET Todo's
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodosQuery;
  switch (true) {
    case status !== undefined && priority !== undefined:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}';`;
      break;
    case priority !== undefined:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case status !== undefined:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
});

//Get Todo's by todoId
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todoData = await db.get(getTodoQuery);
  response.send(todoData);
});

//Post Todo
app.post("/todos/", async (request, response) => {
  const { id = 11, todo, priority, status } = request.body;
  const postTodoQuery = `INSERT INTO todo(id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo's
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let updateTodoQuery;
  let data;
  switch (true) {
    case status !== undefined:
      updateTodoQuery = `UPDATE todo SET status = '${status}';`;
      data = "Status Updated";
      break;
    case priority !== undefined:
      updateTodoQuery = `UPDATE todo SET priority = '${priority}';`;
      data = "Priority Updated";
      break;
    case todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo = '${todo}';`;
      data = "Todo Updated";
      break;
  }
  await db.run(updateTodoQuery);
  response.send(data);
});

//Delete Todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
