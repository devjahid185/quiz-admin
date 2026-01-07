import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ensureCsrf } from '../api';

export default function FeaturesCreate(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('status', status ? 1 : 0);
    if(image) fd.append('image', image);
    try{ await ensureCsrf(); await api.post('/admin/features', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); navigate('/admin/features'); }catch(e){alert('Create failed')}
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Feature</h1>
        <a href="/admin/features" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to List
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Feature Details</h3>
          <p className="text-sm text-gray-500 mt-1">Please fill in the information below.</p>
        </div>

        <form onSubmit={submit} encType="multipart/form-data" className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Feature Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400"
                   placeholder="e.g. Premium Support" />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows="4"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400"
                      placeholder="Write a short description about this feature..."></textarea>
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
              <input type="number" name="serial"
                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400"
                     placeholder="e.g. 10" />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Feature Image</label>

            <div id="preview-container" className="hidden mb-4" style={{display: image ? 'block' : 'none'}}>
              <div className="relative inline-block">
                <img id="image-preview" src={image ? URL.createObjectURL(image) : '#'} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" />
                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200 hover:border-indigo-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                </div>
                <input id="file-upload" name="image" type="file" className="hidden" accept="image/*" onChange={e=>{ if(e.target.files[0]) setImage(e.target.files[0]); }} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <a href="/admin/features" className="text-gray-700 bg-white border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gray-50 transition">Cancel</a>
            <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md hover:shadow-lg transition transform hover:scale-105">Save Feature</button>
          </div>
        </form>
      </div>
    </div>
  )
}
