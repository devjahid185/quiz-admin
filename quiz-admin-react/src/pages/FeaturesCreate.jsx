import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ensureCsrf } from '../api';
import ImageCropperModal from '../components/ImageCropperModal';

export default function FeaturesCreate(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [serial, setSerial] = useState('');
  
  // ইমেজ সম্পর্কিত স্টেট
  const [image, setImage] = useState(null); // ফাইনাল ফাইল
  const [tempImageSrc, setTempImageSrc] = useState(null); // ক্রপিং এর জন্য সোর্স
  const [previewUrl, setPreviewUrl] = useState(null); // ডিসপ্লে প্রিভিউ
  const [showCropper, setShowCropper] = useState(false);

  const navigate = useNavigate();

  // ১. ফাইল সিলেক্ট করার পর ক্রপার ওপেন হবে
  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      e.target.value = null; // ইনপুট রিসেট
    }
  };

  // ২. ক্রপ শেষ হওয়ার পর ফাইল সেট হবে
  const handleCropComplete = (compressedFile, preview) => {
    setImage(compressedFile);
    setPreviewUrl(preview);
    setShowCropper(false);
    setTempImageSrc(null);
  };

  const submit = async (e)=>{
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('status', status ? 1 : 0);
    if(serial) fd.append('serial', serial);
    if(image) fd.append('image', image);
    
    try{
      await ensureCsrf();
      await api.post('/admin/features', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      import('../notify').then(m=>m.notify({ type: 'success', message: 'Feature created successfully' }));
      navigate('/admin/features');
    }catch(e){
      const msg = e?.response?.data?.message || 'Create failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      {/* ক্রপার পপআপ */}
      {showCropper && (
        <ImageCropperModal 
          imageSrc={tempImageSrc}
          onCancel={() => { setShowCropper(false); setTempImageSrc(null); }}
          onCropComplete={handleCropComplete}
        />
      )}

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
                      placeholder="Write a short description..."></textarea>
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
              <input type="number" value={serial} onChange={e=>setSerial(e.target.value)}
                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400"
                     placeholder="e.g. 10" />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Feature Image</label>

            {/* প্রিভিউ এরিয়া */}
            <div id="preview-container" className="mb-4" style={{display: previewUrl ? 'block' : 'none'}}>
              <div className="relative inline-block group">
                <img src={previewUrl || '#'} alt="Preview" className="h-40 w-auto object-cover rounded-lg border border-gray-200 shadow-md" />
                <button 
                  type="button"
                  onClick={() => { setImage(null); setPreviewUrl(null); }}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600 transition"
                  title="Remove Image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200 hover:border-indigo-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span></p>
                  <p className="text-xs text-gray-500">Auto cropped & compressed (JPG)</p>
                </div>
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={onFileSelect} />
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