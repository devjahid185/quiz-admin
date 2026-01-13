import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function QuestionsEdit() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [errors, setErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/admin/categories').then(res => { if (!mounted) return; setCategories(res.data.data); }).catch(() => {});
    api.get('/admin/questions/' + id).then(res => {
      if (!mounted) return;
      const q = res.data.data;
      setQuestionText(q.question_text || q.question || '');
      setOptionA(q.option_a || '');
      setOptionB(q.option_b || '');
      setOptionC(q.option_c || '');
      setOptionD(q.option_d || '');
      setCorrectOption(q.correct_option || '');
      setCategoryId(q.category_id || '');
      setDifficultyLevel(q.difficulty_level || '');
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    return () => mounted = false;
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrors(null);
      await ensureCsrf();
      await api.put('/admin/questions/' + id, {
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        category_id: categoryId || null,
        difficulty_level: difficultyLevel || null,
      });
      import('../notify').then(m => m.notify({ type: 'success', message: 'Question updated successfully' }));
      navigate('/admin/questions');
    } catch (e) {
      const resp = e?.response?.data;
      if (resp?.errors) setErrors(resp.errors);
      const msg = resp?.message || 'Update failed';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading question...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
        <Link to="/admin/questions" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Question Details</h3>
          <p className="text-sm text-gray-600 mt-1">Update the question information and options.</p>
        </div>

        <form onSubmit={submit} className="p-6 md:p-8 space-y-6">
          {/* Question Text */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              rows="4"
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
              placeholder="Enter your question here..."
            />
            {errors?.question_text && <div className="text-sm text-red-600 mt-2">{errors.question_text.join(', ')}</div>}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-blue-700">
                  Option A <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optionA}
                  onChange={e => setOptionA(e.target.value)}
                  required
                  className="bg-blue-50 border-2 border-blue-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                  placeholder="Option A"
                />
                {errors?.option_a && <div className="text-sm text-red-600 mt-2">{errors.option_a.join(', ')}</div>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-purple-700">
                  Option B <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optionB}
                  onChange={e => setOptionB(e.target.value)}
                  required
                  className="bg-purple-50 border-2 border-purple-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full p-3"
                  placeholder="Option B"
                />
                {errors?.option_b && <div className="text-sm text-red-600 mt-2">{errors.option_b.join(', ')}</div>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-pink-700">
                  Option C <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optionC}
                  onChange={e => setOptionC(e.target.value)}
                  required
                  className="bg-pink-50 border-2 border-pink-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 block w-full p-3"
                  placeholder="Option C"
                />
                {errors?.option_c && <div className="text-sm text-red-600 mt-2">{errors.option_c.join(', ')}</div>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-indigo-700">
                  Option D <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optionD}
                  onChange={e => setOptionD(e.target.value)}
                  required
                  className="bg-indigo-50 border-2 border-indigo-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
                  placeholder="Option D"
                />
                {errors?.option_d && <div className="text-sm text-red-600 mt-2">{errors.option_d.join(', ')}</div>}
              </div>
            </div>
          </div>

          {/* Correct Option */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <select
              value={correctOption}
              onChange={e => setCorrectOption(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
            >
              <option value="">Select correct option</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
            {errors?.correct_option && <div className="text-sm text-red-600 mt-2">{errors.correct_option.join(', ')}</div>}
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
              >
                <option value="">Select category (optional)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors?.category_id && <div className="text-sm text-red-600 mt-2">{errors.category_id.join(', ')}</div>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Difficulty Level</label>
              <select
                value={difficultyLevel}
                onChange={e => setDifficultyLevel(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3"
              >
                <option value="">Select difficulty (optional)</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {errors?.difficulty_level && <div className="text-sm text-red-600 mt-2">{errors.difficulty_level.join(', ')}</div>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <Link to="/admin/questions" className="text-gray-700 bg-white border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors ${
                submitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {submitting ? 'Updating...' : 'Update Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
