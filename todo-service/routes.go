package main

import (
	"github.com/gin-gonic/gin"
)

func SetupRouter(todoModel *TodoModel, taskModel *TaskModel, userModel *UserModel) *gin.Engine {
	r := gin.Default()

	// Health check endpoint for Render
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Improved CORS middleware for credentials and dynamic origin
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		// Allow localhost for development and Render domains for production
		if origin == "http://localhost:3000" ||
			origin == "https://todo-frontend.onrender.com" ||
			// You can also use a more flexible pattern
			// strings.HasSuffix(origin, ".onrender.com") {
			origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.POST("/register", RegisterUserHandler(userModel))
	r.POST("/login", LoginUserHandler(userModel))

	auth := r.Group("/")
	auth.Use(func(c *gin.Context) {
		userID, err := c.Cookie("session_user")
		if err != nil || userID == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			return
		}
		c.Set("userID", userID)
		c.Next()
	})

	// Authenticated endpoints
	auth.GET("/me", MeHandler(userModel))
	auth.POST("/logout", LogoutHandler())

	// Task endpoints (CRUD) under a todo
	auth.GET("/todos/:todoId/tasks", GetTasksHandler(taskModel))
	auth.POST("/todos/:todoId/tasks", CreateTaskHandler(taskModel))
	auth.GET("/todos/:todoId/tasks/:id", GetTaskByIDHandler(taskModel))
	auth.PUT("/todos/:todoId/tasks/:id", UpdateTaskHandler(taskModel))
	auth.DELETE("/todos/:todoId/tasks/:id", DeleteTaskHandler(taskModel))

	// Todo endpoints (CRUD) - use /todos/id/:id to avoid Gin wildcard conflict
	auth.GET("/todos", GetTodosHandler(todoModel))
	auth.POST("/todos", CreateTodoHandler(todoModel))
	auth.GET("/todos/id/:id", GetTodoByIDHandler(todoModel))
	auth.PUT("/todos/id/:id", UpdateTodoHandler(todoModel))
	auth.DELETE("/todos/id/:id", DeleteTodoHandler(todoModel))

	return r
}
