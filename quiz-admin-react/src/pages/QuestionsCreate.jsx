import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function QuestionsCreate() {
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
  const [jsonText, setJsonText] = useState('');
  const [jsonPreview, setJsonPreview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preCat = params.get('category_id');
    if (preCat) setCategoryId(preCat);

    let mounted = true;
    api.get('/admin/categories').then(res => { if (!mounted) return; setCategories(res.data.data); }).catch(() => {});
    return () => mounted = false;
  }, [location]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrors(null);
      await ensureCsrf();
      await api.post('/admin/questions', {
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        category_id: categoryId || null,
        difficulty_level: difficultyLevel || null,
      });
      import('../notify').then(m => m.notify({ type: 'success', message: 'Question created successfully' }));
      navigate('/admin/questions');
    } catch (e) {
      const resp = e?.response?.data;
      if (resp?.errors) setErrors(resp.errors);
      const msg = resp?.message || 'Create failed';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const sampleJson = () => {
    return [
      {
        "question_text": "What is the capital of Bangladesh?",
        "option_a": "Dhaka",
        "option_b": "Chittagong",
        "option_c": "Sylhet",
        "option_d": "Rajshahi",
        "correct_option": "a",
        "category_id": 1,
        "difficulty_level": "easy"
      },
      {
        "question_text": "What is 2 + 2?",
        "option_a": "3",
        "option_b": "4",
        "option_c": "5",
        "option_d": "6",
        "correct_option": "b",
        "difficulty_level": "easy"
      }
    ];
  };

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(sampleJson(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-sample.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleJsonFile = async (file) => {
    try {
      const txt = await file.text();
      setJsonText(txt);
      const parsed = JSON.parse(txt);
      setJsonPreview(parsed);
    } catch (e) {
      setJsonPreview(null);
      import('../notify').then(m => m.notify({ type: 'error', message: 'Invalid JSON file' }));
    }
  };

  const submitJsonImport = async () => {
    if (!jsonPreview || !Array.isArray(jsonPreview)) {
      import('../notify').then(m => m.notify({ type: 'error', message: 'JSON must be an array of question objects' }));
      return;
    }
    try {
      setSubmitting(true);
      await ensureCsrf();
      const res = await api.post('/admin/questions/import', jsonPreview);
      const created = res.data.created || [];
      const errors = res.data.errors || {};
      if (Object.keys(errors).length) {
        import('../notify').then(m => m.notify({ type: 'error', message: 'Import finished with some errors. See details below.' }));
      } else {
        import('../notify').then(m => m.notify({ type: 'success', message: `Imported ${created.length} questions` }));
        navigate('/admin/questions');
      }
      setErrors(errors);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Import failed';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Question</h1>
        <Link to="/admin/questions" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Question Details</h3>
          <p className="text-sm text-gray-600 mt-1">Fill in the question information and options.</p>
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

          <hr className="my-6" />
          
          {/* JSON Import Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Import from JSON</h3>
              <div className="space-x-2">
                <button type="button" onClick={downloadSample} className="text-sm px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">
                  Download Sample
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-2 text-sm font-medium text-gray-700">Upload JSON File</label>
              <input
                type="file"
                accept="application/json"
                onChange={e => { if (e.target.files[0]) handleJsonFile(e.target.files[0]); }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div className="mb-3">
              <label className="block mb-2 text-sm font-medium text-gray-700">Or Paste JSON</label>
              <textarea
                rows={8}
                value={jsonText}
                onChange={e => {
                  setJsonText(e.target.value);
                  try {
                    setJsonPreview(JSON.parse(e.target.value));
                  } catch {
                    setJsonPreview(null);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder='[ { "question_text": "What is the capital?", "option_a": "Option A", "option_b": "Option B", "option_c": "Option C", "option_d": "Option D", "correct_option": "a", "category_id": 1, "difficulty_level": "easy" } ]'
              />
            </div>

            <div className="mb-4">
              <button
                type="button"
                disabled={submitting}
                onClick={submitJsonImport}
                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors ${
                  submitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {submitting ? 'Importing...' : 'Import JSON'}
              </button>
            </div>

            {jsonPreview && Array.isArray(jsonPreview) && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm font-medium mb-2 text-gray-900">Preview: {jsonPreview.length} questions</div>
                <ol className="list-decimal list-inside text-xs text-slate-700 max-h-40 overflow-auto space-y-1">
                  {jsonPreview.slice(0, 50).map((it, i) => (
                    <li key={i} className="truncate">
                      {it.question_text || '(no question text)'} — Correct: {it.correct_option?.toUpperCase() || 'N/A'}
                    </li>
                  ))}
                  {jsonPreview.length > 50 && <li className="text-gray-500 italic">... and {jsonPreview.length - 50} more</li>}
                </ol>
              </div>
            )}

            {errors && Object.keys(errors).length > 0 && (
              <div className="mt-3 bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700">
                <div className="font-semibold mb-2">Import Errors</div>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([idx, err]) => (
                    <li key={idx}>
                      Item {parseInt(idx) + 1}: {Object.values(err).map(a => Array.isArray(a) ? a.join(', ') : a).join(' | ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
              {submitting ? 'Creating...' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
