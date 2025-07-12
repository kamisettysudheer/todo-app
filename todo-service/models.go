package main

import (
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"-"`
}

type TodoList struct {
	ID     int64  `json:"id"`
	UserID int64  `json:"user_id"`
	Title  string `json:"title"`
}

type Task struct {
	ID        int64  `json:"id"`
	TodoID    int64  `json:"todo_id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

type UserModel struct {
	db *sql.DB
}

type TodoModel struct {
	db *sql.DB
}

type TaskModel struct {
	db *sql.DB
}

func NewUserModel(db *sql.DB) *UserModel {
	return &UserModel{db: db}
}

func NewTodoModel(db *sql.DB) *TodoModel {
	return &TodoModel{db: db}
}

func NewTaskModel(db *sql.DB) *TaskModel {
	return &TaskModel{db: db}
}

// UserModel methods
func (m *UserModel) Create(username, password string) (User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return User{}, err
	}
	res, err := m.db.Exec("INSERT INTO users (username, password_hash) VALUES (?, ?)", username, string(hash))
	if err != nil {
		return User{}, err
	}
	id, _ := res.LastInsertId()
	return User{ID: fmt.Sprintf("%d", id), Username: username}, nil
}

func (m *UserModel) Authenticate(username, password string) (User, error) {
	var u User
	var hash string
	err := m.db.QueryRow("SELECT id, username, password_hash FROM users WHERE username = ?", username).Scan(&u.ID, &u.Username, &hash)
	if err != nil {
		return User{}, fmt.Errorf("invalid username or password")
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) != nil {
		return User{}, fmt.Errorf("invalid username or password")
	}
	return u, nil
}

// TodoModel methods
func (m *TodoModel) GetAllForUser(userID string) ([]TodoList, error) {
	rows, err := m.db.Query("SELECT id, user_id, title FROM todos WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var todos []TodoList
	for rows.Next() {
		var t TodoList
		if err := rows.Scan(&t.ID, &t.UserID, &t.Title); err == nil {
			todos = append(todos, t)
		}
	}
	return todos, nil
}

func (m *TodoModel) CreateForUser(title string, userID string) (TodoList, error) {
	res, err := m.db.Exec("INSERT INTO todos (user_id, title) VALUES (?, ?)", userID, title)
	if err != nil {
		return TodoList{}, err
	}
	id, _ := res.LastInsertId()
	return TodoList{ID: id, UserID: toInt64(userID), Title: title}, nil
}

func (m *TodoModel) GetByIDForUser(todoID string, userID string) (TodoList, error) {
	var t TodoList
	err := m.db.QueryRow("SELECT id, user_id, title FROM todos WHERE id = ? AND user_id = ?", todoID, userID).Scan(&t.ID, &t.UserID, &t.Title)
	if err != nil {
		return TodoList{}, err
	}
	return t, nil
}

func (m *TodoModel) UpdateForUser(todoID string, title string, userID string) (TodoList, error) {
	_, err := m.db.Exec("UPDATE todos SET title = ? WHERE id = ? AND user_id = ?", title, todoID, userID)
	if err != nil {
		return TodoList{}, err
	}
	return m.GetByIDForUser(todoID, userID)
}

func (m *TodoModel) DeleteForUser(todoID string, userID string) error {
	_, err := m.db.Exec("DELETE FROM todos WHERE id = ? AND user_id = ?", todoID, userID)
	return err
}

// TaskModel methods
func (m *TaskModel) GetAllForTodo(todoID string, userID string) ([]Task, error) {
	// Ensure todo belongs to user
	var check int
	err := m.db.QueryRow("SELECT 1 FROM todos WHERE id = ? AND user_id = ?", todoID, userID).Scan(&check)
	if err != nil {
		return nil, err
	}
	rows, err := m.db.Query("SELECT id, todo_id, title, completed FROM tasks WHERE todo_id = ?", todoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tasks []Task
	for rows.Next() {
		var t Task
		var completedInt int
		if err := rows.Scan(&t.ID, &t.TodoID, &t.Title, &completedInt); err == nil {
			t.Completed = completedInt == 1
			tasks = append(tasks, t)
		}
	}
	return tasks, nil
}

func (m *TaskModel) CreateForTodo(title string, todoID string, userID string) (Task, error) {
	// Ensure todo belongs to user
	var check int
	err := m.db.QueryRow("SELECT 1 FROM todos WHERE id = ? AND user_id = ?", todoID, userID).Scan(&check)
	if err != nil {
		return Task{}, err
	}
	res, err := m.db.Exec("INSERT INTO tasks (todo_id, title, completed) VALUES (?, ?, 0)", todoID, title)
	if err != nil {
		return Task{}, err
	}
	id, _ := res.LastInsertId()
	return Task{ID: id, TodoID: toInt64(todoID), Title: title, Completed: false}, nil
}

func (m *TaskModel) GetByIDForTodo(taskID string, todoID string, userID string) (Task, error) {
	// Ensure todo belongs to user
	var check int
	err := m.db.QueryRow("SELECT 1 FROM todos WHERE id = ? AND user_id = ?", todoID, userID).Scan(&check)
	if err != nil {
		return Task{}, err
	}
	var t Task
	var completedInt int
	err = m.db.QueryRow("SELECT id, todo_id, title, completed FROM tasks WHERE id = ? AND todo_id = ?", taskID, todoID).Scan(&t.ID, &t.TodoID, &t.Title, &completedInt)
	if err != nil {
		return Task{}, err
	}
	t.Completed = completedInt == 1
	return t, nil
}

func (m *TaskModel) UpdateForTodo(taskID string, title string, completed bool, todoID string, userID string) (Task, error) {
	// Ensure todo belongs to user
	var check int
	err := m.db.QueryRow("SELECT 1 FROM todos WHERE id = ? AND user_id = ?", todoID, userID).Scan(&check)
	if err != nil {
		return Task{}, err
	}
	_, err = m.db.Exec("UPDATE tasks SET title = ?, completed = ? WHERE id = ? AND todo_id = ?", title, boolToInt(completed), taskID, todoID)
	if err != nil {
		return Task{}, err
	}
	return m.GetByIDForTodo(taskID, todoID, userID)
}

func (m *TaskModel) DeleteForTodo(taskID string, todoID string, userID string) error {
	// Ensure todo belongs to user
	var check int
	err := m.db.QueryRow("SELECT 1 FROM todos WHERE id = ? AND user_id = ?", todoID, userID).Scan(&check)
	if err != nil {
		return err
	}
	_, err = m.db.Exec("DELETE FROM tasks WHERE id = ? AND todo_id = ?", taskID, todoID)
	return err
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func toInt64(s string) int64 {
	var i int64
	fmt.Sscanf(s, "%d", &i)
	return i
}
