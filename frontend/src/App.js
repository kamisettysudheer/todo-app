import React, { useReducer, useEffect, useRef, useState } from "react";
import "./App.css";
import Auth from "./Auth";
import TodoTabs from "./TodoTabs";
import TodoContent from "./TodoContent";
import UserMenu from "./UserMenu";
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:8080") + "/todos";

const initialState = {
  todos: [],
  user: null,
  loadingUser: true,
  activeId: null,
  activeTodo: null,
  tasks: [],
  loadingTodo: false,
  loadingTasks: false,
  showAdd: false,
  newTitle: "",
  error: "",
  taskError: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.user };
    case "SET_LOADING_USER":
      return { ...state, loadingUser: action.loadingUser };
    case "SET_TODOS":
      return { ...state, todos: action.todos };
    case "SET_ACTIVE_ID":
      return { ...state, activeId: action.activeId };
    case "SET_ACTIVE_TODO":
      return { ...state, activeTodo: action.activeTodo };
    case "SET_TASKS":
      return { ...state, tasks: action.tasks };
    case "SET_LOADING_TODO":
      return { ...state, loadingTodo: action.loadingTodo };
    case "SET_LOADING_TASKS":
      return { ...state, loadingTasks: action.loadingTasks };
    case "SET_SHOW_ADD":
      return { ...state, showAdd: action.showAdd };
    case "SET_NEW_TITLE":
      return { ...state, newTitle: action.newTitle };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_TASK_ERROR":
      return { ...state, taskError: action.taskError };
    case "RESET":
      return { ...initialState, loadingUser: false };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const newTaskInputRef = useRef(null);
  const {
    todos,
    user,
    loadingUser,
    activeId,
    activeTodo,
    tasks,
    loadingTodo,
    loadingTasks,
    showAdd,
    newTitle,
    error,
    taskError
  } = state;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch((process.env.REACT_APP_API_URL || "http://localhost:8080") + "/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          dispatch({ type: "SET_USER", user: { username: data.username } });
        } else {
          dispatch({ type: "SET_USER", user: null });
        }
      } catch {
        dispatch({ type: "SET_USER", user: null });
      }
      dispatch({ type: "SET_LOADING_USER", loadingUser: false });
    };
    checkSession();
  }, []);

  // Fetch todos (list only)
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (res.status === 401) {
        dispatch({ type: "SET_USER", user: null });
        dispatch({ type: "SET_TODOS", todos: [] });
        return;
      }
      const data = await res.json();
      dispatch({ type: "SET_TODOS", todos: Array.isArray(data) ? data : [] });
    } catch (err) {
      dispatch({ type: "SET_TODOS", todos: [] });
    }
  };

  // Fetch tasks for a todo
  const fetchTasks = async (todoId) => {
    dispatch({ type: "SET_LOADING_TASKS", loadingTasks: true });
    dispatch({ type: "SET_TASK_ERROR", taskError: "" });
    try {
      const res = await fetch(`${API_URL}/${todoId}/tasks`, { credentials: "include" });
      if (res.status === 401) {
        dispatch({ type: "SET_USER", user: null });
        dispatch({ type: "SET_TASKS", tasks: [] });
        dispatch({ type: "SET_LOADING_TASKS", loadingTasks: false });
        return;
      }
      const data = await res.json();
      dispatch({ type: "SET_TASKS", tasks: Array.isArray(data) ? data : [] });
    } catch (err) {
      dispatch({ type: "SET_TASKS", tasks: [] });
      dispatch({ type: "SET_TASK_ERROR", taskError: "Failed to load tasks" });
    }
    dispatch({ type: "SET_LOADING_TASKS", loadingTasks: false });
  };

  // Fetch todos when user logs in
  useEffect(() => {
    if (user) {
      (async () => {
        await fetchTodos();
        // After fetching, set the first todo as active (if any)
        if (state.todos.length > 0) {
          dispatch({ type: "SET_ACTIVE_ID", activeId: state.todos[0].id });
        }
      })();
    }
    // eslint-disable-next-line
  }, [user]);

  // Automatically select the first todo as active after todos are loaded
  useEffect(() => {
    if (todos.length > 0 && (!activeId || !todos.some(t => t.id === activeId))) {
      dispatch({ type: "SET_ACTIVE_ID", activeId: todos[0].id });
    }
  }, [todos, activeId]);

  // Lazy load todo details and tasks when activeId changes
  useEffect(() => {
    if (!activeId) {
      dispatch({ type: "SET_ACTIVE_TODO", activeTodo: null });
      dispatch({ type: "SET_TASKS", tasks: [] });
      return;
    }
    dispatch({ type: "SET_LOADING_TODO", loadingTodo: true });
    fetch(`${API_URL}/id/${activeId}`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        dispatch({ type: "SET_ACTIVE_TODO", activeTodo: data });
        dispatch({ type: "SET_LOADING_TODO", loadingTodo: false });
      })
      .catch(() => {
        dispatch({ type: "SET_ACTIVE_TODO", activeTodo: null });
        dispatch({ type: "SET_LOADING_TODO", loadingTodo: false });
      });
    fetchTasks(activeId);
  }, [activeId]);

  // Add new todo (from modal/tab)
  const addTodo = async (e) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", error: "" });
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        const todo = await res.json();
        dispatch({ type: "SET_NEW_TITLE", newTitle: "" });
        dispatch({ type: "SET_SHOW_ADD", showAdd: false });
        await fetchTodos();
        dispatch({ type: "SET_ACTIVE_ID", activeId: todo.id });
      } else if (res.status === 401) {
        dispatch({ type: "SET_USER", user: null });
      } else {
        const data = await res.json();
        dispatch({ type: "SET_ERROR", error: data.error || "Failed to add todo" });
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: "Failed to add todo" });
    }
  };

  // Task CRUD handlers
  const addTask = async (title) => {
    dispatch({ type: "SET_TASK_ERROR", taskError: "" });
    if (!activeId || !title.trim()) return;
    try {
      const res = await fetch(`${API_URL}/${activeId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        fetchTasks(activeId);
      } else if (res.status === 401) {
        dispatch({ type: "SET_USER", user: null });
      } else {
        const data = await res.json();
        dispatch({ type: "SET_TASK_ERROR", taskError: data.error || "Failed to add task" });
      }
    } catch (err) {
      dispatch({ type: "SET_TASK_ERROR", taskError: "Failed to add task" });
    }
  };

  const updateTask = async (taskId, updates) => {
    dispatch({ type: "SET_TASK_ERROR", taskError: "" });
    if (!activeId) return;
    try {
      const res = await fetch(`${API_URL}/${activeId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchTasks(activeId);
      } else if (res.status === 401) {
        dispatch({ type: "SET_USER", user: null });
      } else {
        const data = await res.json();
        dispatch({ type: "SET_TASK_ERROR", taskError: data.error || "Failed to update task" });
      }
    } catch (err) {
      dispatch({ type: "SET_TASK_ERROR", taskError: "Failed to update task" });
    }
  };

  const deleteTask = async (taskId) => {
    dispatch({ type: "SET_TASK_ERROR", taskError: "" });
    if (!activeId) return;
    try {
      const res = await fetch(`${API_URL}/${activeId}/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchTasks(activeId);
      } else if (res.status === 401) {
        dispatch({ type: "SET_USER", user: null });
      } else {
        dispatch({ type: "SET_TASK_ERROR", taskError: "Failed to delete task" });
      }
    } catch (err) {
      dispatch({ type: "SET_TASK_ERROR", taskError: "Failed to delete task" });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+N or Cmd+N: Add new todo tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        dispatch({ type: "SET_SHOW_ADD", showAdd: true });
        setTimeout(() => {
          const input = document.querySelector('input[placeholder="New todo title"]');
          if (input) input.focus();
        }, 100);
      }
      // Ctrl+K or Cmd+K: Focus main task input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (newTaskInputRef.current) newTaskInputRef.current.focus();
      }
      // Ctrl+Left/Right or Cmd+Left/Right: Switch tabs
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!todos.length || !activeId) return;
        e.preventDefault();
        const idx = todos.findIndex(t => t.id === activeId);
        if (idx === -1) return;
        let newIdx = idx;
        if (e.key === 'ArrowLeft') newIdx = (idx - 1 + todos.length) % todos.length;
        if (e.key === 'ArrowRight') newIdx = (idx + 1) % todos.length;
        dispatch({ type: "SET_ACTIVE_ID", activeId: todos[newIdx].id });
      }
      // Ctrl+W or Cmd+W: Delete current tab (if any)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        if (!todos.length || !activeId) return;
        e.preventDefault();
        // Confirm before deleting
        if (window.confirm("Delete this todo list and all its tasks?")) {
          const id = activeId;
          (async () => {
            try {
              const res = await fetch(`${API_URL}/id/${id}`, { method: "DELETE", credentials: "include" });
              if (res.ok) {
                await fetchTodos();
                // If the deleted tab was active, select another
                if (todos.length > 1) {
                  const idx = todos.findIndex(t => t.id === id);
                  const next = todos[(idx + 1) % todos.length]?.id || todos[0]?.id;
                  dispatch({ type: "SET_ACTIVE_ID", activeId: next });
                } else {
                  dispatch({ type: "SET_ACTIVE_ID", activeId: null });
                }
              } else if (res.status === 401) {
                dispatch({ type: "SET_USER", user: null });
              }
            } catch {
              alert("Failed to delete todo list");
            }
          })();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdd, todos, activeId]);

  const handleLogout = () => {
    fetch((process.env.REACT_APP_API_URL || "http://localhost:8080") + "/logout", { credentials: "include", method: "POST" })
      .then(res => {
        if (res.ok) {
          dispatch({ type: "RESET" });
        }
      });
  };

  return (
    <div className="app">
      <header className="header">
        <h1 className="app-title">Todo App</h1>
        <div className="header-actions">
          <button
            className="theme-toggle-btn"
            aria-label="Toggle dark/light mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          {user && (
            <button
              className="user-icon-btn"
              aria-label="User menu"
              onClick={() => setShowUserMenu(v => !v)}
            >
              <span className="user-icon" role="img" aria-label="user">👤</span>
            </button>
          )}
        </div>
        {showUserMenu && user && (
          <UserMenu
            username={user.username}
            onLogout={handleLogout}
            onShowShortcuts={() => { setShowShortcuts(true); setShowUserMenu(false); }}
          />
        )}
        {loadingUser && <div className="loading">Loading user info...</div>}
      </header>
      {!loadingUser && !user && (
        <div className="auth-prompt auth-header">
          <Auth onLogin={user => dispatch({ type: "SET_USER", user })} />
        </div>
      )}
      {user && (
        <main className="main-content">
          <TodoTabs
            todos={todos}
            activeId={activeId}
            onSelect={id => dispatch({ type: "SET_ACTIVE_ID", activeId: id })}
            onAdd={() => dispatch({ type: "SET_SHOW_ADD", showAdd: true })}
            onDelete={async (id) => {
              if (!window.confirm("Delete this todo list and all its tasks?")) return;
              try {
                const res = await fetch(`${API_URL}/id/${id}`, { method: "DELETE", credentials: "include" });
                if (res.ok) {
                  await fetchTodos();
                  // If the deleted tab was active, select another
                  if (activeId === id && todos.length > 1) {
                    const idx = todos.findIndex(t => t.id === id);
                    const next = todos[(idx + 1) % todos.length]?.id || todos[0]?.id;
                    dispatch({ type: "SET_ACTIVE_ID", activeId: next });
                  } else if (todos.length === 1) {
                    dispatch({ type: "SET_ACTIVE_ID", activeId: null });
                  }
                } else if (res.status === 401) {
                  dispatch({ type: "SET_USER", user: null });
                }
              } catch {
                alert("Failed to delete todo list");
              }
            }}
          />
          {showAdd && (
            <form onSubmit={addTodo} style={{ margin: '20px 0', display: 'flex', gap: 8 }}>
              <input
                value={newTitle}
                onChange={e => dispatch({ type: "SET_NEW_TITLE", newTitle: e.target.value })}
                placeholder="New todo title"
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
                autoFocus
              />
              <button type="submit" style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #bbb', background: '#fff', fontWeight: 600 }}>Add</button>
              <button type="button" onClick={() => dispatch({ type: "SET_SHOW_ADD", showAdd: false })} style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #bbb', background: '#fff', fontWeight: 600 }}>Cancel</button>
            </form>
          )}
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {loadingTodo && <div className="loading">Loading todo details...</div>}
          {!loadingTodo && activeTodo && (
            <TodoContent
              todo={activeTodo}
              tasks={tasks}
              loadingTasks={loadingTasks}
              error={error}
              taskError={taskError}
              newTaskInputRef={newTaskInputRef}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onDeleteTodoList={async (id) => {
                if (!window.confirm("Delete this todo list and all its tasks?")) return;
                try {
                  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", credentials: "include" });
                  if (res.ok) {
                    await fetchTodos();
                    // If the deleted tab was active, select another
                    if (activeId === id && todos.length > 1) {
                      const idx = todos.findIndex(t => t.id === id);
                      const next = todos[(idx + 1) % todos.length]?.id || todos[0]?.id;
                      dispatch({ type: "SET_ACTIVE_ID", activeId: next });
                    } else if (todos.length === 1) {
                      dispatch({ type: "SET_ACTIVE_ID", activeId: null });
                    }
                  } else if (res.status === 401) {
                    dispatch({ type: "SET_USER", user: null });
                  }
                } catch {
                  alert("Failed to delete todo list");
                }
              }}
            />
          )}
          {!loadingTodo && !activeTodo && (
            <div className="no-active-todo">
              <p>Select a todo to view or add tasks.</p>
            </div>
          )}
        </main>
      )}
      {showShortcuts && (
        <div className="shortcuts-modal" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-content" onClick={e => e.stopPropagation()}>
            <h3>Keyboard Shortcuts</h3>
            <ul>
              <li><b>Ctrl/Cmd + N</b>: Add new todo tab</li>
              <li><b>Ctrl/Cmd + K</b>: Focus main task input</li>
              <li><b>Ctrl/Cmd + Left/Right</b>: Switch tabs</li>
              <li><b>Ctrl/Cmd + W</b>: Delete current todo tab</li>
            </ul>
            <button onClick={() => setShowShortcuts(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
