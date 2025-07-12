import React from "react";

function UserMenu({ username, onLogout, onShowShortcuts }) {
  return (
    <div className="user-menu-popup">
      <div className="user-menu-item"><b>username :</b> {username}</div>
      <button className="user-menu-item" onClick={onShowShortcuts}>keyboard shortcuts</button>
      <button className="user-menu-item" onClick={onLogout}>logout</button>
    </div>
  );
}

export default UserMenu;
