import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import api, { ensureCsrf, storageUrl } from '../api';

// --- Helper Function to Create Cropped Image Blob ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

// --- Main Component ---
export default function BannersIndex() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', image: '', link: '', is_active: false, position: 0 });
  const [selectedFile, setSelectedFile] = useState(null); // The actual file blob to upload
  const [previewUrl, setPreviewUrl] = useState(null);     // To show in form

  // Crop State
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banners');
      setBanners(res.data.data || res.data);
    } catch (e) {
      // ignore
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', image: '', link: '', is_active: false, position: 0 });
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ title: b.title || '', image: b.image || '', link: b.link || '', is_active: !!b.is_active, position: b.position || 0 });
    setSelectedFile(null);
    setPreviewUrl(b.image ? storageUrl(b.image) : null);
    setFormOpen(true);
  };

  // --- Image Handling ---
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setCropOpen(true); // Open Cropper
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const objectUrl = URL.createObjectURL(croppedBlob);
      
      setPreviewUrl(objectUrl);
      setSelectedFile(croppedBlob); // Ready to upload
      setCropOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Save Logic (FormData) ---
  const save = async () => {
    try {
      await ensureCsrf();
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('link', form.link);
      formData.append('is_active', form.is_active ? '1' : '0');
      formData.append('position', form.position);
      
      if (selectedFile) {
        formData.append('image_file', selectedFile, 'banner.jpg');
      }

      if (editing) {
        formData.append('_method', 'PUT'); // Laravel PUT spoofing
        await api.post(`/admin/banners/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setFormOpen(false);
      fetch();
    } catch (e) {
      alert('Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete banner?')) return;
    try { await ensureCsrf(); await api.delete(`/admin/banners/${id}`); fetch(); } catch (e) { alert('Delete failed'); }
  };

  const toggle = async (id) => {
    try { await ensureCsrf(); await api.post(`/admin/banners/${id}/toggle`); fetch(); } catch (e) { alert('Toggle failed'); }
  };

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Banners</h1>
          <p className="mt-2 text-sm text-slate-500">Manage homepage/app banners shown to users.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700">Add Banner</button>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Link</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">No banners found.</td></tr>
              ) : (
                banners.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3"><img src={b.image ? storageUrl(b.image) : 'https://via.placeholder.com/150'} alt="banner" className="h-16 w-32 object-cover rounded shadow-sm" /></td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{b.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{b.link || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{b.position}</td>
                    <td className="px-6 py-3 text-center text-sm">
                      {b.is_active ? <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Active</span> : <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">Inactive</span>}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium space-x-2">
                      <button onClick={() => openEdit(b)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => toggle(b.id)} className="text-slate-600 hover:text-slate-900">Toggle</button>
                      <button onClick={() => remove(b.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? 'Edit Banner' : 'Create Banner'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image (16:9)</label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-20 w-36 object-cover rounded border" />
                  ) : (
                    <div className="h-20 w-36 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onFileChange} 
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Select to crop</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Link (optional)</label>
                <input value={form.link} onChange={e => setForm(s => ({ ...s, link: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(s => ({ ...s, is_active: e.target.checked }))} className="rounded text-indigo-600 focus:ring-indigo-500" /> 
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  Position 
                  <input type="number" value={form.position} onChange={e => setForm(s => ({ ...s, position: Number(e.target.value) }))} className="w-20 p-1 border border-gray-300 rounded-md" />
                </label>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={() => setFormOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">Save Banner</button>
            </div>
          </div>
        </div>
      )}

      {/* CROPPER MODAL */}
      {cropOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1 bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 5} // ✅ 16:9 Ratio
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="p-4 bg-white flex items-center justify-between gap-4">
            <div className="w-1/2">
              <label className="text-xs font-bold text-gray-500">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCropOpen(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
              <button onClick={showCroppedImage} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Crop & Select</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}