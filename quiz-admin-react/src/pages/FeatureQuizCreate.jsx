import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function FeatureQuizCreate() {
  const [features, setFeatures] = useState([]);
  const [featureId, setFeatureId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [status, setStatus] = useState(1);
  const [serial, setSerial] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const previewRef = useRef();
  const [jsonText, setJsonText] = useState('');
  const [jsonPreview, setJsonPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/admin/features').then(res => { if (!mounted) return; setFeatures(res.data.data); }).catch(() => { });
    return () => mounted = false;
  }, []);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => { URL.revokeObjectURL(url); setImagePreview(null); };
    }
  }, [image]);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('feature_id', featureId);
    fd.append('quiz_title', quizTitle);
    fd.append('question', question);
    fd.append('option_1', option1);
    fd.append('option_2', option2);
    fd.append('option_3', option3);
    fd.append('option_4', option4);
    fd.append('correct_answer', correctAnswer);
    fd.append('status', status ? 1 : 0);
    if (serial) fd.append('serial', serial);
    if (image) fd.append('image', image);
    try {
      setSubmitting(true);
      setErrors(null);
      await ensureCsrf();
      await api.post('/feature-quizzes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      import('../notify').then(m => m.notify({ type: 'success', message: 'Feature quiz created' }));
      navigate('/admin/feature-quizzes');
    } catch (e) {
      const resp = e?.response?.data;
      if (resp?.errors) setErrors(resp.errors);
      const msg = resp?.message || 'Create failed';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    } finally { setSubmitting(false); }
  }

  const sampleJson = () => {
    return [
      {
        "feature_id": 1,
        "quiz_title": "Sample Feature Quiz",
        "question": "What is the capital of France?",
        "option_1": "Paris",
        "option_2": "London",
        "option_3": "Rome",
        "option_4": "Madrid",
        "correct_answer": "1",
        "status": 1,
        "serial": 1
      }
    ];
  }

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(sampleJson(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-quizzes-sample.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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
  }

  const submitJsonImport = async () => {
    if (!jsonPreview || !Array.isArray(jsonPreview)) {
      import('../notify').then(m => m.notify({ type: 'error', message: 'JSON must be an array of feature quiz objects' }));
      return;
    }
    try {
      setSubmitting(true);
      await ensureCsrf();
      const res = await api.post('/feature-quizzes/import', jsonPreview);
      const created = res.data.created || [];
      const errors = res.data.errors || {};
      if (Object.keys(errors).length) {
        import('../notify').then(m => m.notify({ type: 'error', message: 'Import finished with some errors. See details below.' }));
      } else {
        import('../notify').then(m => m.notify({ type: 'success', message: `Imported ${created.length} items` }));
      }
      setErrors(errors);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Import failed';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    } finally { setSubmitting(false); }
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Feature Quiz</h1>
        <a href="/admin/feature-quizzes" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to List
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Feature Quiz Details</h3>
          <p className="text-sm text-gray-500 mt-1">Fill in the feature quiz information.</p>
        </div>

        <form onSubmit={submit} encType="multipart/form-data" className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Feature <span className="text-red-500">*</span></label>
            <select value={featureId} onChange={e => setFeatureId(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3">
              <option value="">Select feature</option>
              {features.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
            {errors?.feature_id && <div className="text-sm text-red-600 mt-2">{errors.feature_id.join(', ')}</div>}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Quiz Title <span className="text-red-500">*</span></label>
            <input type="text" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Question</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} rows="4" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={option1} onChange={e => setOption1(e.target.value)} placeholder="Option 1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            <input value={option2} onChange={e => setOption2(e.target.value)} placeholder="Option 2" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            <input value={option3} onChange={e => setOption3(e.target.value)} placeholder="Option 3" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            <input value={option4} onChange={e => setOption4(e.target.value)} placeholder="Option 4" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Correct Answer</label>
            <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} placeholder="e.g. Option 1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Status</label>
              <select value={status} onChange={e => setStatus(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Serial / Order</label>
              <input value={serial} onChange={e => setSerial(e.target.value)} type="number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Image</label>

            <div id="preview-container" className="mb-4" style={{ display: image ? 'block' : (imagePreview ? 'block' : 'none') }}>
              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" ref={previewRef} className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                </div>
                <input name="image" type="file" className="hidden" accept="image/*" onChange={e => { if (e.target.files[0]) setImage(e.target.files[0]); }} />
              </label>
            </div>
            {errors?.image && <div className="text-sm text-red-600 mt-2">{errors.image.join(', ')}</div>}
          </div>

          <hr />
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Import from JSON</h3>
              <div className="space-x-2">
                <button type="button" onClick={downloadSample} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Download sample</button>
              </div>
            </div>

            <div className="mb-3">
              <input type="file" accept="application/json" onChange={e => { if (e.target.files[0]) handleJsonFile(e.target.files[0]); }} />
            </div>

            <div className="mb-3">
              <label className="block mb-2 text-sm">Or paste JSON</label>
              <textarea rows={8} value={jsonText} onChange={e => { setJsonText(e.target.value); try { setJsonPreview(JSON.parse(e.target.value)); } catch { setJsonPreview(null); } }} className="w-full border rounded p-2 bg-white text-sm" placeholder='[ { "feature_id": 1, "quiz_title": "..." } ]'></textarea>
            </div>

            <div className="mb-4">
              <button type="button" disabled={submitting} onClick={submitJsonImport} className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded">Import JSON</button>
            </div>

            {jsonPreview && Array.isArray(jsonPreview) && (
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-sm font-medium mb-2">Preview: {jsonPreview.length} items</div>
                <ol className="list-decimal list-inside text-xs text-slate-700 max-h-40 overflow-auto">
                  {jsonPreview.slice(0, 50).map((it, i) => (
                    <li key={i}>{it.quiz_title || '(no title)'} — feature: {it.feature_id || 'N/A'}</li>
                  ))}
                </ol>
              </div>
            )}

            {errors && Object.keys(errors).length > 0 && (
              <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded text-sm text-red-700">
                <div className="font-semibold">Import errors</div>
                <ul className="list-disc list-inside">
                  {Object.entries(errors).map(([idx, err]) => (
                    <li key={idx}>Item {idx}: {Object.values(err).map(a => a.join(', ')).join(' | ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <a href="/admin/feature-quizzes" className="text-gray-700 bg-white border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-50">Cancel</a>
            <button type="submit" disabled={submitting} className={`text-white ${submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} font-medium rounded-lg text-sm px-5 py-2.5`}>{submitting ? 'Saving...' : 'Save Feature Quiz'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}