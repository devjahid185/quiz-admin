import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    api.get("/admin/check")
      .then(() => setAuth(true))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return null;

  return (
    <Routes>
      <Route
        path="/admin/login"
        element={auth ? <Navigate to="/admin/dashboard" /> : <Login setAuth={setAuth} />}
      />

      <Route
        path="/admin/dashboard"
        element={auth ? <Dashboard setAuth={setAuth} /> : <Navigate to="/admin/login" />}
      />

      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}

export default App;
