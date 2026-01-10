import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function SubCategoriesCreate(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [image, setImage] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/categories').then(res=>{ if(!mounted) return; setCategories(res.data.data); }).catch(()=>{});
    return ()=> mounted = false;
  },[]);

  const submit = async (e)=>{
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('status', status ? 1 : 0);
    fd.append('category_id', categoryId);
    if(image) fd.append('image', image);
    try{
      await ensureCsrf();
      await api.post('/admin/sub-categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/admin/sub-categories');
    }catch(e){
      const msg = e?.response?.data?.message || 'Create failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Sub Category</h1>
        <Link to="/admin/sub-categories" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Sub Category Details</h3>
          <p className="text-sm text-gray-500 mt-1">Please fill in the information below.</p>
        </div>

        <form onSubmit={submit} encType="multipart/form-data" className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Parent Category <span className="text-red-500">*</span></label>
            <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
              <option value="">Select Category</option>
              {categories.map(c=> <option value={c.id} key={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" placeholder="e.g. Summer Sale" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows="4" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" placeholder="Optional description..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Status</label>
              <select value={status} onChange={e=>setStatus(Number(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Image</label>
              <input type="file" accept="image/*" onChange={e=>{ if(e.target.files[0]) setImage(e.target.files[0]); }} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2.5" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <Link to="/admin/sub-categories" className="text-gray-700 bg-white border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gray-50 transition">Cancel</Link>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md hover:shadow-lg transition transform hover:scale-105">Save Sub Category</button>
          </div>
        </form>
      </div>
    </div>
  )
}
