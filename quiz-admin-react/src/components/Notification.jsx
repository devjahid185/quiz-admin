import { useEffect, useState } from 'react';

function Toast({ id, type, message, onClose }){
  useEffect(()=>{
    const t = setTimeout(()=> onClose(id), 4000);
    return ()=> clearTimeout(t);
  },[id,onClose]);

  const bg = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const text = type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`max-w-sm w-full ${bg} border p-3 rounded-lg shadow-sm flex items-start gap-3`}>
      <div className={`flex-shrink-0 mt-0.5 ${text}`}>
        {type === 'error' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        )}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-medium ${text}`}>{type === 'error' ? 'Error' : 'Success'}</div>
        <div className="text-sm text-gray-700 mt-1 break-words">{message}</div>
      </div>
      <button onClick={()=>onClose(id)} className="text-gray-400 hover:text-gray-700 ml-3">✕</button>
    </div>
  )
}

export default function Notification(){
  const [toasts, setToasts] = useState([]);

  useEffect(()=>{
    const handler = (e)=>{
      const id = Date.now() + Math.random();
      setToasts(t=>[...t, { id, ...e.detail }]);
    };
    window.addEventListener('notify', handler);
    return ()=> window.removeEventListener('notify', handler);
  },[]);

  const remove = (id)=> setToasts(t=>t.filter(x=>x.id!==id));

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(t=> <Toast key={t.id} {...t} onClose={remove} />)}
    </div>
  )
}
