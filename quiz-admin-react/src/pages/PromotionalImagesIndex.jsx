import React, { useEffect, useState } from 'react';
import api, { ensureCsrf, storageUrl } from '../api';

export default function PromotionalImagesIndex() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // States for form & file
  const [form, setForm] = useState({ title: '', image: '', link: '', is_active: false, position: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/promotional-images');
      setItems(res.data.data || res.data);
    } catch (e) {
      // ignore
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  // --- Modal Handlers ---
  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', image: '', link: '', is_active: false, position: 0 });
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ 
      title: item.title || '', 
      image: item.image || '', 
      link: item.link || '', 
      is_active: !!item.is_active, 
      position: item.position || 0 
    });
    setSelectedFile(null);
    setPreviewUrl(item.image ? storageUrl(item.image) : null);
    setFormOpen(true);
  };

  // --- File Handler ---
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show preview instantly
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
        formData.append('image_file', selectedFile);
      }

      if (editing) {
        formData.append('_method', 'PUT'); // Laravel PUT spoofing
        await api.post(`/admin/promotional-images/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/promotional-images', formData, {
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
    if (!confirm('Delete image?')) return;
    try { await ensureCsrf(); await api.delete(`/admin/promotional-images/${id}`); fetch(); } catch (e) { alert('Delete failed'); }
  };

  const toggle = async (id) => {
    try { await ensureCsrf(); await api.post(`/admin/promotional-images/${id}/toggle`); fetch(); } catch (e) { alert('Toggle failed'); }
  };

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Promotional Images</h1>
          <p className="mt-2 text-sm text-slate-500">Manage promotional visuals used across the app.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700">Add Image</button>
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
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">No images found.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <img 
                        src={item.image ? storageUrl(item.image) : 'https://via.placeholder.com/150'} 
                        alt="promo" 
                        className="h-16 w-32 object-cover rounded shadow-sm border border-gray-100" 
                      />
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{item.link || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{item.position}</td>
                    <td className="px-6 py-3 text-center text-sm">
                      {item.is_active ? 
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Active</span> : 
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">Inactive</span>
                      }
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium space-x-2">
                      <button onClick={() => openEdit(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => toggle(item.id)} className="text-slate-600 hover:text-slate-900">Toggle</button>
                      <button onClick={() => remove(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? 'Edit Image' : 'Add Promotional Image'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Image Input & Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image File</label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-20 w-32 object-cover rounded border border-gray-200" />
                  ) : (
                    <div className="h-20 w-32 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onFileChange} 
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm(s => ({ ...s, title: e.target.value }))} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="Promo Title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Link (optional)</label>
                <input 
                  value={form.link} 
                  onChange={e => setForm(s => ({ ...s, link: e.target.value }))} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.is_active} 
                    onChange={e => setForm(s => ({ ...s, is_active: e.target.checked }))} 
                    className="rounded text-indigo-600 focus:ring-indigo-500" 
                  /> 
                  Active
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  Position 
                  <input 
                    type="number" 
                    value={form.position} 
                    onChange={e => setForm(s => ({ ...s, position: Number(e.target.value) }))} 
                    className="w-20 p-1 border border-gray-300 rounded-md text-center" 
                  />
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t">
              <button onClick={() => setFormOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">Save Image</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}