import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/admin/dashboard/statistics")
      .then((res) => {
        if (mounted && res.data.success) {
          setStats(res.data.data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load dashboard statistics");
          console.error(err);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error || "Failed to load data"}</div>
      </div>
    );
  }

  const counts = stats.counts || {};
  const recent = stats.recent || {};
  const balances = stats.balances || {};
  const distributions = stats.distributions || {};
  const growth = stats.growth || [];
  const recentLists = stats.recent_lists || {};
  const topCategories = stats.top_categories || [];

  // Calculate max value for charts
  const maxCategoryCount = distributions.categories?.length > 0
    ? Math.max(...distributions.categories.map(c => c.count))
    : 1;

  const maxGrowthValue = growth.length > 0
    ? Math.max(...growth.map(g => Math.max(g.users, g.quizzes, g.questions)))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your quiz platform.</p>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-700">Total Users</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{counts.total_users || 0}</div>
              <div className="text-xs text-blue-600 mt-1">
                <span className="font-semibold">+{recent.today?.users || 0}</span> today
              </div>
            </div>
            <div className="bg-blue-500 text-white p-4 rounded-xl">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Quizzes */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-700">Total Quizzes</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">{counts.total_quizzes || 0}</div>
              <div className="text-xs text-purple-600 mt-1">
                <span className="font-semibold">{counts.active_quizzes || 0}</span> active
              </div>
            </div>
            <div className="bg-purple-500 text-white p-4 rounded-xl">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Questions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700">Total Questions</div>
              <div className="text-3xl font-bold text-green-900 mt-2">{counts.total_questions || 0}</div>
              <div className="text-xs text-green-600 mt-1">
                <span className="font-semibold">+{recent.today?.questions || 0}</span> today
              </div>
            </div>
            <div className="bg-green-500 text-white p-4 rounded-xl">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-lg p-6 border border-indigo-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-indigo-700">Total Categories</div>
              <div className="text-3xl font-bold text-indigo-900 mt-2">{counts.total_categories || 0}</div>
              <div className="text-xs text-indigo-600 mt-1">
                <span className="font-semibold">{counts.active_categories || 0}</span> active
              </div>
            </div>
            <div className="bg-indigo-500 text-white p-4 rounded-xl">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="text-sm text-gray-500">Feature Quizzes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{counts.total_feature_quizzes || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="text-sm text-gray-500">Sub Categories</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{counts.total_sub_categories || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="text-sm text-gray-500">Blocked Users</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{counts.blocked_users || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="text-sm text-gray-500">Total Coin Balance</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{balances.total_coin_balance?.toLocaleString() || 0}</div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Distribution by Category</h2>
          <div className="space-y-3">
            {distributions.categories && distributions.categories.length > 0 ? (
              distributions.categories.map((cat, idx) => {
                const percentage = (cat.count / maxCategoryCount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 truncate flex-1 mr-2">{cat.name}</span>
                      <span className="text-gray-500 font-semibold">{cat.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 py-8">No category data available</div>
            )}
          </div>
        </div>

        {/* Difficulty Level Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions by Difficulty Level</h2>
          <div className="space-y-4">
            {distributions.difficulty_levels && distributions.difficulty_levels.length > 0 ? (
              distributions.difficulty_levels.map((diff, idx) => {
                const total = distributions.difficulty_levels.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? (diff.count / total) * 100 : 0;
                const colors = {
                  Easy: 'from-green-500 to-emerald-500',
                  Medium: 'from-yellow-500 to-amber-500',
                  Hard: 'from-red-500 to-rose-500',
                };
                return (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium text-gray-700">{diff.level}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`h-8 rounded-lg bg-gradient-to-r ${colors[diff.level] || 'from-gray-500 to-gray-600'}`} style={{ width: `${percentage}%`, minWidth: '20px' }}>
                          <div className="h-full flex items-center justify-end pr-2">
                            <span className="text-white text-xs font-bold">{diff.count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 py-8">No difficulty data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Growth (Last 14 Days)</h2>
        {growth.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No growth data available
          </div>
        ) : (
          <>
            <div className="h-64 flex items-end justify-between gap-2 pb-8 px-2">
              {growth.slice(-14).map((day, idx) => {
                const date = new Date(day.date + 'T00:00:00');
                const dayLabel = date.getDate();
                const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
                const totalDay = day.users + day.quizzes + day.questions;
                const userPercent = totalDay > 0 ? (day.users / totalDay) * 100 : 0;
                const quizPercent = totalDay > 0 ? (day.quizzes / totalDay) * 100 : 0;
                const questionPercent = totalDay > 0 ? (day.questions / totalDay) * 100 : 0;
                const barHeight = maxGrowthValue > 0 ? Math.max((totalDay / maxGrowthValue) * 100, totalDay > 0 ? 5 : 0) : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative" style={{ maxWidth: '45px' }}>
                    <div className="w-full relative" style={{ height: '200px' }}>
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${barHeight}%` }}>
                        {day.users > 0 && (
                          <div
                            className="bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                            style={{ height: `${userPercent}%` }}
                            title={`Users: ${day.users} on ${day.date}`}
                          />
                        )}
                        {day.quizzes > 0 && (
                          <div
                            className="bg-gradient-to-t from-purple-500 to-purple-400 transition-all hover:from-purple-600 hover:to-purple-500 cursor-pointer"
                            style={{ height: `${quizPercent}%` }}
                            title={`Quizzes: ${day.quizzes} on ${day.date}`}
                          />
                        )}
                        {day.questions > 0 && (
                          <div
                            className="bg-gradient-to-t from-green-500 to-green-400 transition-all hover:from-green-600 hover:to-green-500 cursor-pointer"
                            style={{ height: `${questionPercent}%` }}
                            title={`Questions: ${day.questions} on ${day.date}`}
                          />
                        )}
                        {totalDay === 0 && (
                          <div className="h-1 bg-gray-200"></div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-6 text-center w-full">
                      <div className="text-xs text-gray-500 font-medium">{dayLabel}</div>
                      {idx === growth.slice(-14).length - 1 && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{monthLabel}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Questions</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Data and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentLists.users && recentLists.users.length > 0 ? (
              recentLists.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-3 text-right">
                    <div className="text-sm font-semibold text-amber-600">{user.coin_balance || 0} coins</div>
                    {user.blocked && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                        Blocked
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">No recent users</div>
            )}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Quizzes</h2>
            <Link to="/admin/quizzes" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentLists.quizzes && recentLists.quizzes.length > 0 ? (
              recentLists.quizzes.map((quiz) => (
                <div key={quiz.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900 truncate">{quiz.quiz_title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {quiz.category?.title || 'No category'}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      quiz.status
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {quiz.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">No recent quizzes</div>
            )}
          </div>
        </div>

        {/* Recent Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Questions</h2>
            <Link to="/admin/questions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentLists.questions && recentLists.questions.length > 0 ? (
              recentLists.questions.map((question) => (
                <div key={question.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-sm text-gray-900 line-clamp-2">
                    {question.question_text || question.question || 'No question text'}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                    {question.difficulty_level && (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        question.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                        question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {question.difficulty_level.charAt(0).toUpperCase() + question.difficulty_level.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">No recent questions</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Quickly access common tasks and management pages</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/quizzes/create"
            className="bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="h-6 w-6 mx-auto mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <div className="text-sm font-medium text-gray-700">Create Quiz</div>
          </Link>
          <Link
            to="/admin/questions/create"
            className="bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="h-6 w-6 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <div className="text-sm font-medium text-gray-700">Add Question</div>
          </Link>
          <Link
            to="/admin/categories/create"
            className="bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="h-6 w-6 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <div className="text-sm font-medium text-gray-700">New Category</div>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="h-6 w-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-700">Manage Users</div>
          </Link>
          <Link
            to="/admin/quizzes"
            className="bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 rounded-lg p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="h-6 w-6 mx-auto mb-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm font-medium text-gray-700">All Quizzes</div>
          </Link>
          <Link
            to="/admin/questions"
            className="bg-white hover:bg-pink-50 border border-gray-200 hover:border-pink-300 rounded-lg p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="h-6 w-6 mx-auto mb-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm font-medium text-gray-700">All Questions</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
