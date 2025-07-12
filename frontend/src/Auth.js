import React, { useReducer } from "react";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const initialState = {
  isLogin: true,
  username: "",
  password: "",
  error: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOGIN":
      return { ...state, isLogin: action.value };
    case "SET_USERNAME":
      return { ...state, username: action.value };
    case "SET_PASSWORD":
      return { ...state, password: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "RESET":
      return { ...state, username: "", password: "", error: "" };
    default:
      return state;
  }
}


function Auth({ onLogin }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLogin, username, password, error } = state;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", value: "" });
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const res = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (onLogin) onLogin({ username });
        dispatch({ type: "RESET" });
      } else {
        dispatch({ type: "SET_ERROR", value: data.error || data.message || "Failed" });
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", value: "Network error" });
    }
  };

  return (
    <div className="auth-box">
      <div className="auth-header">
        <h2 className="auth-title">{isLogin ? "Login" : "Register"}</h2>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          value={username}
          onChange={e => dispatch({ type: "SET_USERNAME", value: e.target.value })}
          placeholder="Username"
        />
        <input
          className="auth-input"
          type="password"
          value={password}
          onChange={e => dispatch({ type: "SET_PASSWORD", value: e.target.value })}
          placeholder="Password"
        />
        <button className="auth-btn" type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <button
        className="auth-toggle-btn"
        type="button"
        onClick={() => dispatch({ type: "SET_LOGIN", value: !isLogin })}
      >
        {isLogin ? "Need an account? Register" : "Already have an account? Login"}
      </button>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}

export default Auth;
