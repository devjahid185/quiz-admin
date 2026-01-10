import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { ensureCsrf, storageUrl } from '../api';

export default function QuizzesEdit(){
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
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
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/categories').then(res=>{ if(!mounted) return; setCategories(res.data.data); }).catch(()=>{});
    api.get('/admin/sub-categories').then(res=>{ if(!mounted) return; setSubCategories(res.data.data); }).catch(()=>{});
    api.get('/admin/quizzes/' + id).then(res=>{
      const q = res.data.data;
      setCategoryId(q.category_id || '');
      setSubCategoryId(q.sub_category_id || '');
      setQuizTitle(q.quiz_title || '');
      setQuestion(q.question || '');
      setOption1(q.option_1 || '');
      setOption2(q.option_2 || '');
      setOption3(q.option_3 || '');
      setOption4(q.option_4 || '');
      setCorrectAnswer(q.correct_answer || '');
      setStatus(q.status ? 1 : 0);
      setSerial(q.serial || '');
      setExistingImage(q.image || null);
    }).catch(()=>{});
    return ()=> mounted = false;
  },[id]);

  useEffect(()=>{
    if(image){
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => { URL.revokeObjectURL(url); setImagePreview(null); };
    }
  },[image]);

  const submit = async (e)=>{
    e.preventDefault();
    const fd = new FormData();
    fd.append('category_id', categoryId);
    if(subCategoryId) fd.append('sub_category_id', subCategoryId);
    fd.append('quiz_title', quizTitle);
    fd.append('question', question);
    fd.append('option_1', option1);
    fd.append('option_2', option2);
    fd.append('option_3', option3);
    fd.append('option_4', option4);
    fd.append('correct_answer', correctAnswer);
    fd.append('status', status ? 1 : 0);
    if(serial) fd.append('serial', serial);
    if(image) fd.append('image', image);
    try{
      setSubmitting(true);
      setErrors(null);
      await ensureCsrf();
      // use POST with _method=PUT so PHP receives multipart form-data (PUT with files is not supported)
      fd.append('_method', 'PUT');
      await api.post('/admin/quizzes/' + id, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      import('../notify').then(m=>m.notify({ type: 'success', message: 'Quiz updated' }));
      navigate('/admin/quizzes');
    }catch(e){
      const resp = e?.response?.data;
      if(resp?.errors) setErrors(resp.errors);
      const msg = resp?.message || 'Update failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    }finally{ setSubmitting(false); }
  }

  const filteredSubs = subCategories.filter(s=> s.category_id == categoryId);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
        <a href="/admin/quizzes" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Quiz Details</h3>
        </div>

        <form onSubmit={submit} encType="multipart/form-data" className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
              <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3">
                <option value="">Select category</option>
                {categories.map(c=> <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors?.category_id && <div className="text-sm text-red-600 mt-2">{errors.category_id.join(', ')}</div>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Sub Category</label>
              <select value={subCategoryId} onChange={e=>setSubCategoryId(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3">
                <option value="">None</option>
                {filteredSubs.map(s=> <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Quiz Title <span className="text-red-500">*</span></label>
            <input type="text" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Question</label>
            <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows="4" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={option1} onChange={e=>setOption1(e.target.value)} placeholder="Option 1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            <input value={option2} onChange={e=>setOption2(e.target.value)} placeholder="Option 2" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            <input value={option3} onChange={e=>setOption3(e.target.value)} placeholder="Option 3" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            <input value={option4} onChange={e=>setOption4(e.target.value)} placeholder="Option 4" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Correct Answer</label>
            <input value={correctAnswer} onChange={e=>setCorrectAnswer(e.target.value)} placeholder="e.g. Option 2" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Status</label>
              <select value={status} onChange={e=>setStatus(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Serial / Order</label>
              <input value={serial} onChange={e=>setSerial(e.target.value)} type="number" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-3" />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Image</label>
            {existingImage && !imagePreview && (
              <div className="mb-3">
                <img src={storageUrl(existingImage)} alt="Existing" className="h-24 w-24 object-cover rounded" />
              </div>
            )}
            {imagePreview && (
              <div className="mb-3">
                <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded" />
              </div>
            )}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                </div>
                <input name="image" type="file" className="hidden" accept="image/*" onChange={e=>{ if(e.target.files[0]) setImage(e.target.files[0]); }} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <a href="/admin/quizzes" className="text-gray-700 bg-white border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-gray-50">Cancel</a>
            <button type="submit" disabled={submitting} className={`text-white ${submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} font-medium rounded-lg text-sm px-5 py-2.5`}>{submitting ? 'Updating...' : 'Update Quiz'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
