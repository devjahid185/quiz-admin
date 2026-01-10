import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { ensureCsrf, storageUrl } from '../api';

export default function CategoriesIndex(){
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const elRef = useRef(null);

  useEffect(()=>{
    let mounted = true;
    api.get('/admin/categories').then(res=>{
      if(!mounted) return;
      setCats(res.data.data);
    }).catch(()=>{}).finally(()=>mounted && setLoading(false));
    return ()=> mounted = false;
  },[]);

  // sort using SortableJS if available
  useEffect(()=>{
    if(!window.Sortable) return;
    const el = elRef.current;
    if(!el) return;
    const sortable = new window.Sortable(el,{
      animation: 150,
      handle: 'td:first-child',
      ghostClass: 'bg-indigo-50',
      onEnd: async ()=>{
        const order = Array.from(el.querySelectorAll('tr')).map(r=>r.dataset.id);
        try{
          await ensureCsrf();
          await api.post('/admin/categories/sort', { order });
        }catch(e){console.error(e)}
      }
    });
    return ()=> sortable.destroy();
  },[loading]);

  const remove = async (id)=>{
    if(!confirm('Are you sure you want to delete this category?')) return;
    try{
      await ensureCsrf();
      await api.delete('/admin/categories/' + id);
      setCats(s=>s.filter(x=>x.id!==id));
    }catch(e){
      const msg = e?.response?.data?.message || 'Delete failed';
      import('../notify').then(m=>m.notify({ type: 'error', message: msg }));
    }
  }

  return (
    <div className="container mx-auto sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your product categories and ordering.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/admin/categories/create" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow">
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add Category
          </Link>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="bg-white shadow rounded-2xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">Sort</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody ref={elRef} className="bg-white divide-y divide-gray-200">
                {cats.map(cat=> (
                  <tr key={cat.id} data-id={cat.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap cursor-move text-gray-400 hover:text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        {cat.image ? (
                          <img src={storageUrl(cat.image)} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{cat.title}</div>
                      <div className="text-xs text-gray-500">{cat.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {cat.status ? (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link to={`/admin/categories/${cat.id}/edit`} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </Link>
                        <button onClick={()=>remove(cat.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
