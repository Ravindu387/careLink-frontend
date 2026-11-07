import { useState, useEffect } from "react";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const normalizedPath = currentPath.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/login") {
    return <LoginPage />;
  }

  if (normalizedPath === "/register") {
    return <RegisterPage />;
  }

  return <HomePage />;
}

export default App;
