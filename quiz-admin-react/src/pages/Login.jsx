import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { ensureCsrf } from "../api";

export default function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setLoading(true);
    try {
      // try ensure CSRF for sanctum-backed apps
      await ensureCsrf();

      const res = await api.post("/admin/login", {
        email,
        password,
        remember,
      });

      if (res?.data?.success) {
        setAuth(true);
        navigate("/admin/dashboard");
      } else {
        setError(res?.data?.message || "Login failed. Check credentials.");
      }
    } catch (err) {
      if (err?.response?.data?.message) setError(err.response.data.message);
      else setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        <div className="p-8 md:flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">QA</div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Portal</h1>
              <p className="text-sm text-gray-500">Sign in to manage quizzes and users</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                type="email"
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                placeholder="you@company.com"
                aria-label="Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                type="password"
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                placeholder="Your password"
                aria-label="Password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
                <span className="text-gray-600">Remember me</span>
              </label>

              <a href="#" className="text-blue-600">Forgot password?</a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-60"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : null}
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="hidden md:block md:w-1/3 bg-blue-50 p-6">
          <h3 className="text-lg font-medium mb-2 text-blue-700">Welcome back</h3>
          <p className="text-sm text-blue-600">Manage quizzes, view reports, and control users from the dashboard.</p>
        </div>
      </div>
    </div>
  );
}
