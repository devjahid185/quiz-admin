import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { ensureCsrf, storageUrl } from '../api';
import ImageCropperModal from '../components/ImageCropperModal';

export default function FeaturesEdit(){
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [serial, setSerial] = useState('');
  
  // ইমেজ স্টেট
  const [imageFile, setImageFile] = useState(null); // নতুন ফাইল
  const [existingImage, setExistingImage] = useState(null); // সার্ভার ইমেজ পাথ
  const [tempImageSrc, setTempImageSrc] = useState(null); // ক্রপিং সোর্স
  const [previewUrl, setPreviewUrl] = useState(null); // ডিসপ্লে প্রিভিউ
  const [showCropper, setShowCropper] = useState(false);

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

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };

  const handleCropComplete = (compressedFile, preview) => {
    setImageFile(compressedFile);
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
    if(imageFile) fd.append('image', imageFile);
    
    try{
      await ensureCsrf();
      await api.post('/admin/features/' + id + '?_method=PUT', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      import('../notify').then(m=>m.notify({ type: 'success', message: 'Feature updated successfully' }));
      navigate('/admin/features');
    }catch(e){
      const msg = e?.response?.data?.message || 'Update failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    }
  }

  if(loading) return <div className="p-6">Loading...</div>

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      {/* ক্রপার মডাল */}
      {showCropper && (
        <ImageCropperModal 
          imageSrc={tempImageSrc}
          onCancel={() => { setShowCropper(false); setTempImageSrc(null); }}
          onCropComplete={handleCropComplete}
        />
      )}

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
                      {/* প্রিভিউ লজিক: নতুন ক্রপ করা ইমেজ > পুরনো ইমেজ > ডিফল্ট প্লেসহোল্ডার */}
                      <img id="edit-image-preview" 
                           src={previewUrl ? previewUrl : (existingImage ? storageUrl(existingImage) : 'https://via.placeholder.com/150?text=No+Image')} 
                           className="h-32 w-auto object-cover rounded-md" alt="" />
                  </div>
              </div>

              <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Update Image</label>
                  <div 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition hover:border-indigo-400 relative"
                  >
                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className="text-sm text-gray-500">Click to replace image</p>
                     </div>
                     <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={onFileSelect} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Auto cropped & compressed. Leave empty to keep current.</p>
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