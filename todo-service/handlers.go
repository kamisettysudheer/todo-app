package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Import model types
//go:generate go run models.go

// /me endpoint: returns current user info if logged in
func MeHandler(userModel *UserModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		// Fetch username from DB
		var username string
		err := userModel.db.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": userID, "username": username})
	}
}

// /logout endpoint: clears session cookie

func LogoutHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.SetCookie("session_user", "", -1, "/", "", false, true)
		c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
	}
}

func RegisterUserHandler(userModel *UserModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		user, err := userModel.Create(input.Username, input.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
			return
		}
		// Set session cookie after registration for immediate login
		c.SetCookie("session_user", user.ID, 3600, "/", "", false, true)
		c.JSON(http.StatusCreated, gin.H{"message": "User registered", "user": user.Username})
	}
}

func LoginUserHandler(userModel *UserModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		user, err := userModel.Authenticate(input.Username, input.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}
		// Set session cookie with SameSite=None and Secure=false for localhost dev
		c.SetCookie("session_user", user.ID, 3600, "/", "", false, true)
		c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": user.Username})
	}
}

// Todo Handlers
func GetTodosHandler(todoModel *TodoModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		todos, err := todoModel.GetAllForUser(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, todos)
	}
}

func CreateTodoHandler(todoModel *TodoModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		var input struct {
			Title string `json:"title"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		todo, err := todoModel.CreateForUser(input.Title, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, todo)
	}
}

func GetTodoByIDHandler(todoModel *TodoModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		id := c.Param("id")
		todo, err := todoModel.GetByIDForUser(id, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
			return
		}
		c.JSON(http.StatusOK, todo)
	}
}

func UpdateTodoHandler(todoModel *TodoModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		id := c.Param("id")
		var input struct {
			Title string `json:"title"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		todo, err := todoModel.UpdateForUser(id, input.Title, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
			return
		}
		c.JSON(http.StatusOK, todo)
	}
}

func DeleteTodoHandler(todoModel *TodoModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		id := c.Param("id")
		err := todoModel.DeleteForUser(id, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
			return
		}
		c.Status(http.StatusNoContent)
	}
}

// Updated Task Handlers for multi-todo
func GetTasksHandler(taskModel *TaskModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		todoID := c.Param("todoId")
		tasks, err := taskModel.GetAllForTodo(todoID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tasks)
	}
}

func CreateTaskHandler(taskModel *TaskModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		todoID := c.Param("todoId")
		var input struct {
			Title string `json:"title"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		task, err := taskModel.CreateForTodo(input.Title, todoID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, task)
	}
}

func GetTaskByIDHandler(taskModel *TaskModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		todoID := c.Param("todoId")
		id := c.Param("id")
		task, err := taskModel.GetByIDForTodo(id, todoID, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusOK, task)
	}
}

func UpdateTaskHandler(taskModel *TaskModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		todoID := c.Param("todoId")
		id := c.Param("id")
		var input struct {
			Title     string `json:"title"`
			Completed bool   `json:"completed"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		task, err := taskModel.UpdateForTodo(id, input.Title, input.Completed, todoID, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusOK, task)
	}
}

func DeleteTaskHandler(taskModel *TaskModel) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		todoID := c.Param("todoId")
		id := c.Param("id")
		err := taskModel.DeleteForTodo(id, todoID, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.Status(http.StatusNoContent)
	}
}
