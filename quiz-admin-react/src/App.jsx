import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { ensureCsrf } from "./api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersIndex from "./pages/UsersIndex";
import UsersCreate from "./pages/UsersCreate";
import UsersEdit from "./pages/UsersEdit";
import UserDetails from "./pages/UserDetails";
import CategoriesIndex from "./pages/CategoriesIndex";
import CategoriesCreate from "./pages/CategoriesCreate";
import CategoriesEdit from "./pages/CategoriesEdit";
import SubCategoriesIndex from "./pages/SubCategoriesIndex";
import SubCategoriesCreate from "./pages/SubCategoriesCreate";
import SubCategoriesEdit from "./pages/SubCategoriesEdit";
import QuizzesIndex from "./pages/QuizzesIndex";
import QuizzesCreate from "./pages/QuizzesCreate";
import QuizzesEdit from "./pages/QuizzesEdit";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import FeaturesIndex from "./pages/FeaturesIndex";
import FeaturesCreate from "./pages/FeaturesCreate";
import FeaturesEdit from "./pages/FeaturesEdit";
import FeatureQuizIndex from "./pages/FeatureQuizIndex";
import FeatureQuizCreate from "./pages/FeatureQuizCreate";
import FeatureQuizEdit from "./pages/FeatureQuizEdit";
import QuestionsIndex from "./pages/QuestionsIndex";
import QuestionsCreate from "./pages/QuestionsCreate";
import QuestionsEdit from "./pages/QuestionsEdit";
import Leaderboard from "./pages/Leaderboard";
import CoinConversionSettings from "./pages/CoinConversionSettings";
import WithdrawalManagement from "./pages/WithdrawalManagement";
import WithdrawalSettings from "./pages/WithdrawalSettings";
import BannersIndex from "./pages/BannersIndex";
import PromotionalImagesIndex from "./pages/PromotionalImagesIndex";
import SendNotification from "./pages/SendNotification";

function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Check auth status on app load/refresh
    const checkAuth = async () => {
      try {
        // Check if user is authenticated via session (withCredentials already set in api.js)
        const response = await api.get("/admin/check");
        
        // Check response status and data
        if (response?.status === 200) {
          // If response has authenticated: true or admin data, user is authenticated
          if (response.data?.authenticated === true || response.data?.admin) {
            setAuth(true);
            return;
          }
        }
        setAuth(false);
      } catch (error) {
        // If 401 or 403, user is not authenticated
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          setAuth(false);
        } else {
          // Network error or other issue
          console.error('Auth check error:', error?.response?.status || error?.message);
          // Set to false only if we have a response (clear auth failure)
          setAuth(error?.response ? false : (prev => prev !== null ? prev : false));
        }
      }
    };

    checkAuth();
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
        path="/admin/users/:id"
        element={auth ? <Layout><UserDetails /></Layout> : <Navigate to="/admin/login" />}
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

      {/* FeatureQuiz routes */}
      <Route
        path="/admin/feature-quizzes"
        element={auth ? <Layout><FeatureQuizIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/feature-quizzes/create"
        element={auth ? <Layout><FeatureQuizCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/feature-quizzes/:id/edit"
        element={auth ? <Layout><FeatureQuizEdit /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/profile"
        element={auth ? <Layout><Profile /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/sub-categories"
        element={auth ? <Layout><SubCategoriesIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/sub-categories/create"
        element={auth ? <Layout><SubCategoriesCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/sub-categories/:id/edit"
        element={auth ? <Layout><SubCategoriesEdit /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/quizzes"
        element={auth ? <Layout><QuizzesIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/quizzes/create"
        element={auth ? <Layout><QuizzesCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/quizzes/:id/edit"
        element={auth ? <Layout><QuizzesEdit /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/questions"
        element={auth ? <Layout><QuestionsIndex /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/questions/create"
        element={auth ? <Layout><QuestionsCreate /></Layout> : <Navigate to="/admin/login" />}
      />
      <Route
        path="/admin/questions/:id/edit"
        element={auth ? <Layout><QuestionsEdit /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/leaderboard"
        element={auth ? <Layout><Leaderboard /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/coin-conversion"
        element={auth ? <Layout><CoinConversionSettings /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/withdrawals"
        element={auth ? <Layout><WithdrawalManagement /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/withdrawal-settings"
        element={auth ? <Layout><WithdrawalSettings /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/banners"
        element={auth ? <Layout><BannersIndex /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/promotional-images"
        element={auth ? <Layout><PromotionalImagesIndex /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route
        path="/admin/notifications"
        element={auth ? <Layout><SendNotification /></Layout> : <Navigate to="/admin/login" />}
      />

      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}

export default App;

