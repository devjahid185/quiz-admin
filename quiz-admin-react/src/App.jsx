import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersIndex from "./pages/UsersIndex";
import UsersCreate from "./pages/UsersCreate";
import UsersEdit from "./pages/UsersEdit";
import CategoriesIndex from "./pages/CategoriesIndex";
import CategoriesCreate from "./pages/CategoriesCreate";
import CategoriesEdit from "./pages/CategoriesEdit";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import FeaturesIndex from "./pages/FeaturesIndex";
import FeaturesCreate from "./pages/FeaturesCreate";
import FeaturesEdit from "./pages/FeaturesEdit";

function App() {
  const [auth, setAuth] = useState(null);

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
        element={auth ? <Layout><Dashboard /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/users"
        element={auth ? <Layout><UsersIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/users/create"
        element={auth ? <Layout><UsersCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/users/:id/edit"
        element={auth ? <Layout><UsersEdit /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/categories"
        element={auth ? <Layout><CategoriesIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/categories/create"
        element={auth ? <Layout><CategoriesCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/categories/:id/edit"
        element={auth ? <Layout><CategoriesEdit /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/features"
        element={auth ? <Layout><FeaturesIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/features/create"
        element={auth ? <Layout><FeaturesCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/features/:id/edit"
        element={auth ? <Layout><FeaturesEdit /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/profile"
        element={auth ? <Layout><Profile /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}

export default App;

