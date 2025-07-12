import React, { useState, useEffect, useRef } from "react";

function TodoContent({ todo, loading, tasks, loadingTasks, onAddTask, onUpdateTask, onDeleteTask, onDeleteTodoList, taskError, newTaskInputRef }) {
  const [newTask, setNewTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  // If ref not provided, use local ref for fallback
  const localInputRef = useRef(null);
  const inputRef = newTaskInputRef || localInputRef;

  useEffect(() => {
    if (inputRef.current) inputRef.current.blur(); // prevent auto-focus on mount
  }, []);

  if (loading) return <div className="todo-content-loading">Loading...</div>;
  if (!todo) return <div className="todo-content-select">Select a todo</div>;

  return (
    <div className="todo-content-box">
      <div className="todo-content-title-row">
        <span className="todo-content-title">{todo.title}</span>

      </div>
      <div>
        <form onSubmit={e => { e.preventDefault(); if (newTask.trim()) { onAddTask(newTask); setNewTask(""); } }} className="todo-content-add-form">
          <input
            ref={inputRef}
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="add task"
            className="todo-content-add-input"
          />
          <button type="submit" className="todo-content-add-btn">add</button>
        </form>
        {taskError && <div className="todo-content-error">{taskError}</div>}
        {loadingTasks ? (
          <div className="todo-content-tasks-loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="todo-content-tasks-empty">No tasks yet</div>
        ) : (
          <ul className="todo-content-tasks-list">
            {tasks.map(task => (
              <li key={task.id} className="todo-content-task-row">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onUpdateTask(task.id, { title: task.title, completed: !task.completed })}
                  className="todo-content-task-checkbox"
                />
                {editId === task.id ? (
                  <form onSubmit={e => { e.preventDefault(); onUpdateTask(task.id, { title: editValue, completed: task.completed }); setEditId(null); }} className="todo-content-task-edit-form">
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="todo-content-task-edit-input"
                      autoFocus
                    />
                    <button type="submit" className="todo-content-task-edit-btn">Save</button>
                    <button type="button" onClick={() => setEditId(null)} className="todo-content-task-cancel-btn">Cancel</button>
                  </form>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 18, textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "#aaa" : "#222" }}>{task.title}</span>
                    <button onClick={() => { setEditId(task.id); setEditValue(task.title); }} style={{ border: "1px solid #bbb", borderRadius: 5, background: "#fff", padding: "4px 12px", marginLeft: 4 }}>Edit</button>
                    <button onClick={() => onDeleteTask(task.id)} style={{ border: "1px solid #f55", borderRadius: 5, background: "#fff", color: "#f55", padding: "4px 12px", marginLeft: 4 }}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TodoContent;
