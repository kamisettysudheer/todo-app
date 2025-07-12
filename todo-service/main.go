package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "todos.db")
	if err != nil {
		log.Fatal("failed to connect to sqlite3:", err)
	}
	// Create users table
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users (
	   id INTEGER PRIMARY KEY AUTOINCREMENT,
	   username TEXT NOT NULL UNIQUE,
	   password_hash TEXT NOT NULL
   )`)
	if err != nil {
		log.Fatal("failed to create users table:", err)
	}

	// Each user can have multiple todo lists
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS todos (
	   id INTEGER PRIMARY KEY AUTOINCREMENT,
	   user_id INTEGER NOT NULL,
	   title TEXT NOT NULL,
	   FOREIGN KEY(user_id) REFERENCES users(id)
	)`)
	if err != nil {
		log.Fatal("failed to create todos table:", err)
	}

	// Each todo has many tasks
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS tasks (
	   id INTEGER PRIMARY KEY AUTOINCREMENT,
	   todo_id INTEGER NOT NULL,
	   title TEXT NOT NULL,
	   completed INTEGER NOT NULL,
	   FOREIGN KEY(todo_id) REFERENCES todos(id)
	)`)
	if err != nil {
		log.Fatal("failed to create tasks table:", err)
	}

	// Model setup
	todoModel := NewTodoModel(db)
	taskModel := NewTaskModel(db)
	userModel := NewUserModel(db)

	// Use modular router
	r := SetupRouter(todoModel, taskModel, userModel)
	fmt.Println("Starting server on :8080")
	r.Run(":8080")
}
