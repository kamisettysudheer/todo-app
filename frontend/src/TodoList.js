import React from "react";

function TodoList({ todos, onToggle, onDelete }) {
  if (!Array.isArray(todos)) return null;
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {todos.map((todo) => (
        <li
          key={todo.id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            background: "#f9f9f9",
            padding: 10,
            borderRadius: 4,
          }}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo)}
            style={{ marginRight: 10 }}
          />
          <span
            style={{
              flex: 1,
              textDecoration: todo.completed ? "line-through" : "none",
              color: todo.completed ? "#888" : "#222",
            }}
          >
            {todo.title}
          </span>
          <button
            onClick={() => onDelete(todo.id)}
            style={{ marginLeft: 10, color: "#fff", background: "#e74c3c", border: "none", borderRadius: 3, padding: "4px 8px", cursor: "pointer" }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;
