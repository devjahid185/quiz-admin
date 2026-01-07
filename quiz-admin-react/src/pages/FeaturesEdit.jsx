import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { ensureCsrf, storageUrl } from '../api';

export default function FeaturesEdit(){
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [serial, setSerial] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/features/' + id).then(res=>{
      if(!mounted) return;
      const it = res.data.data;
      setTitle(it.title);
      setDescription(it.description || '');
      setStatus(it.status);
      setSerial(it.serial || '');
      setExistingImage(it.image);
    }).catch(()=>{}).finally(()=>mounted && setLoading(false));
    return ()=> mounted = false;
  },[id]);

  const submit = async (e)=>{
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('status', status ? 1 : 0);
    if(serial) fd.append('serial', serial);
    if(imageFile) fd.append('image', imageFile);
    try{ await ensureCsrf(); await api.post('/admin/features/' + id + '?_method=PUT', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); navigate('/admin/features'); }catch(e){alert('Update failed')}
  }

  const editPreviewImage = (e)=>{
    const file = e.target.files[0];
    if(!file) return setPreview(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ()=> setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  if(loading) return <div className="p-6">Loading...</div>

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Feature: <span className="text-indigo-600">{title}</span></h1>
        <Link to="/admin/features" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
             <h3 className="text-lg font-semibold text-gray-900">Edit Details</h3>
        </div>

        <form onSubmit={submit} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Features Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} required
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Status</label>
              <select value={status} onChange={e=>setStatus(Number(e.target.value))}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Serial / Order</label>
              <input value={serial} onChange={e=>setSerial(e.target.value)} type="number"
                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="md:col-span-1">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Image Preview</label>
                  <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm inline-block">
                      <img id="edit-image-preview" 
                           src={preview ? preview : (existingImage ? storageUrl(existingImage) : 'https://via.placeholder.com/150?text=No+Image')} 
                           className="h-32 w-32 object-cover rounded-md" alt="" />
                  </div>
              </div>

              <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Update Image</label>
                      <input type="file" name="image" accept="image/*" onChange={editPreviewImage}
                         className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-indigo-500 p-2.5" />
                  <p className="mt-1 text-xs text-gray-500">Leave empty to keep current image. Supported: JPG, PNG, GIF.</p>
              </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <Link to="/admin/features" className="text-gray-700 bg-white border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gray-50 transition">Cancel</Link>
                <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md hover:shadow-lg transition transform hover:scale-105">Update Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
