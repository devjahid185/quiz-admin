import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { ensureCsrf, storageUrl } from '../api';

export default function FeatureQuizEdit() {
  const { id } = useParams();
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
  const [existingImage, setExistingImage] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const previewRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    // Load features
    api.get('/admin/features')
      .then(res => { if (!mounted) return; setFeatures(res.data.data); })
      .catch(() => { });
      
    // Load feature quiz data
    api.get(`/feature-quizzes/${id}`)
      .then(res => {
        if (!mounted) return;
        const data = res.data.data;
        setFeatureId(data.feature_id);
        setQuizTitle(data.quiz_title);
        setQuestion(data.question || '');
        setOption1(data.option_1 || '');
        setOption2(data.option_2 || '');
        setOption3(data.option_3 || '');
        setOption4(data.option_4 || '');
        setCorrectAnswer(data.correct_answer || '');
        setStatus(data.status || 1);
        setSerial(data.serial || '');
        setExistingImage(data.image || '');
      })
      .catch(() => setErrors({ general: 'Failed to load feature quiz' }))
      .finally(() => mounted && setLoading(false));
      
    return () => mounted = false;
  }, [id]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => { URL.revokeObjectURL(url); setImagePreview(null); };
    }
  }, [image]);

  const handleSubmit = async (e) => {
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
    
    // For PUT with FormData, we need to spoof the method
    fd.append('_method', 'PUT');
    
    setSubmitting(true);
    setErrors(null);
    try {
      await ensureCsrf();
      await api.post(`/feature-quizzes/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      import('../notify').then(m => m.notify({ type: 'success', message: 'Feature quiz updated' }));
      navigate('/admin/feature-quizzes');
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.errors) setErrors(resp.errors);
      const msg = resp?.message || 'Failed to update feature quiz';
      import('../notify').then(m => m.notify({ type: 'error', message: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setExistingImage('');
  };

  if (loading) return <div className="container mx-auto py-8">Loading...</div>;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Feature Quiz</h1>
        <a href="/admin/feature-quizzes" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to List
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Edit Feature Quiz</h3>
          <p className="text-sm text-gray-500 mt-1">Update the feature quiz information.</p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 md:p-8 space-y-6">
          {errors?.general && <div className="mb-4 text-red-600">{errors.general}</div>}
          
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

            <div id="preview-container" className="mb-4">
              {(imagePreview || existingImage) && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview || storageUrl(existingImage)} 
                    alt="preview" 
                    ref={previewRef} 
                    className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
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

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <a href="/admin/feature-quizzes" className="text-gray-700 bg-white border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-50">Cancel</a>
            <button type="submit" disabled={submitting} className={`text-white ${submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} font-medium rounded-lg text-sm px-5 py-2.5`}>
              {submitting ? 'Updating...' : 'Update Feature Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}