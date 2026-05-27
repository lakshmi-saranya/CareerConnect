import Header from "./Header";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <div className="content">
        <main>{children}</main>
      </div>
    </div>
  );
}

export default Layout;