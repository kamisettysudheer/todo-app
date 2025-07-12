import React from "react";

function TodoTabs({ todos, activeId, onSelect, onAdd, onDelete }) {
  return (
    <div className="todo-tabs-bar">
      {todos.map((todo) => (
        <button
          key={todo.id}
          onClick={() => onSelect(todo.id)}
          className={`todo-tab${activeId === todo.id ? " active" : ""}`}
          style={{ position: 'relative', paddingRight: 32 }}
        >
          {todo.title}
          <span
            className="todo-tab-delete-btn"
            title="Delete this todo list"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--danger)',
              fontSize: 18,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              lineHeight: 1,
              zIndex: 2
            }}
            onClick={e => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            aria-label="Delete todo list"
          >
            ×
          </span>
        </button>
      ))}
      <button
        onClick={onAdd}
        className="todo-tab add-tab"
        title="Add Todo"
      >
        +
      </button>
    </div>
  );
}

export default TodoTabs;
