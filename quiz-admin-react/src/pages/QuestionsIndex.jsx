import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function QuestionsIndex() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [categoryId, setCategoryId] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preCat = params.get('category_id');
    const preDiff = params.get('difficulty_level');
    if (preCat) setCategoryId(preCat);
    if (preDiff) setDifficultyLevel(preDiff);

    let mounted = true;
    api.get('/admin/categories').then(res => { if (!mounted) return; setCategories(res.data.data); }).catch(() => {});
    return () => mounted = false;
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/admin/questions', {
      params: {
        category_id: categoryId || undefined,
        difficulty_level: difficultyLevel || undefined,
        search: search || undefined,
        page,
        per_page: perPage
      }
    }).then(res => {
      if (!mounted) return;
      setQuestions(res.data.data || []);
      setPagination(res.data.pagination || { current_page: 1, last_page: 1, per_page: 10, total: 0 });
    }).catch(() => {}).finally(() => mounted && setLoading(false));
    return () => mounted = false;
  }, [categoryId, difficultyLevel, search, page, perPage]);

  // Keep page in sync with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (categoryId) params.set('category_id', categoryId);
    else params.delete('category_id');
    if (difficultyLevel) params.set('difficulty_level', difficultyLevel);
    else params.delete('difficulty_level');
    if (search) params.set('search', search);
    else params.delete('search');
    if (page > 1) params.set('page', page);
    else params.delete('page');
    navigate({ search: params.toString() }, { replace: true });
  }, [categoryId, difficultyLevel, search, page]);

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await ensureCsrf();
      await api.delete('/admin/questions/' + id);
      setQuestions(s => s.filter(x => x.id !== id));
      import('../notify').then(m => m.notify({ type: 'success', message: 'Question deleted' }));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Delete failed';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    }
  };

  const getDifficultyBadge = (level) => {
    if (!level) return null;
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hard: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${colors[level] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const getCorrectOptionBadge = (option) => {
    const colors = {
      a: 'bg-blue-100 text-blue-800',
      b: 'bg-purple-100 text-purple-800',
      c: 'bg-pink-100 text-pink-800',
      d: 'bg-indigo-100 text-indigo-800',
    };
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs font-bold rounded ${colors[option?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {option?.toUpperCase() || '-'}
      </span>
    );
  };

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Questions</h1>
          <p className="mt-2 text-sm text-slate-500">Manage quiz questions with options and correct answers.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/admin/questions/create" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow">
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Question
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 text-sm w-full"
              placeholder="Search questions..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm w-full bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={difficultyLevel}
              onChange={e => { setDifficultyLevel(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm w-full bg-white"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end">
            {(categoryId || difficultyLevel || search) && (
              <button
                onClick={() => { setCategoryId(''); setDifficultyLevel(''); setSearch(''); setPage(1); }}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading questions...</div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-2xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Options</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Correct</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No questions found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or create a new question.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {questions.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md">
                        {q.question_text || q.question || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center">
                          <span className="font-semibold text-blue-600 w-6">A:</span>
                          <span className="text-gray-700">{q.option_a || '-'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold text-purple-600 w-6">B:</span>
                          <span className="text-gray-700">{q.option_b || '-'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold text-pink-600 w-6">C:</span>
                          <span className="text-gray-700">{q.option_c || '-'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold text-indigo-600 w-6">D:</span>
                          <span className="text-gray-700">{q.option_d || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getCorrectOptionBadge(q.correct_option)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{q.category?.title || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getDifficultyBadge(q.difficulty_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link to={`/admin/questions/${q.id}/edit`} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors" title="Edit">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </Link>
                        <button onClick={() => remove(q.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {pagination.last_page > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} questions
              </div>
              <div className="flex gap-1">
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.current_page <= 1}
                >
                  Prev
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 2)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                      <button
                        className={`px-3 py-1 rounded border text-sm ${p === pagination.current_page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-100'}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={pagination.current_page >= pagination.last_page}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
