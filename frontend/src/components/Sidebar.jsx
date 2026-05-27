function Sidebar() {
  const user = {
    name: "Moksha",
    email: "moksha@example.com"
  };

  return (
    <aside className="sidebar">
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    </aside>
  );
}

export default Sidebar;
