import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [showRegister, setShowRegister] = useState(false);

  if (!loggedIn) {
    if (showRegister) {
      return (
        <Register
          onGoToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        onLogin={() => setLoggedIn(true)}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Dashboard
      onLogout={() => setLoggedIn(false)}
    />
  );
}

export default App;