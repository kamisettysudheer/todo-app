import React from "react";

function TodoForm({ title, setTitle, onAdd, loading }) {
  return (
    <form onSubmit={onAdd} style={{ marginBottom: 20 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo"
        style={{ padding: 8, width: "70%" }}
        disabled={loading}
      />
      <button type="submit" style={{ padding: 8, marginLeft: 8 }} disabled={loading}>
        Add
      </button>
    </form>
  );
}

export default TodoForm;
