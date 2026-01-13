// src/components/ImageCropperModal.jsx
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils'; // পাথ ঠিক রাখুন
import imageCompression from 'browser-image-compression';

export default function ImageCropperModal({ imageSrc, onCancel, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Flutter Card Aspect Ratio (Width 304px, Height আনুমানিক 190px -> 16:10 বা 16:9)
  // 16/9 দিলে স্ট্যান্ডার্ড কার্ড লুক আসবে
  const ASPECT_RATIO = 16 / 9; 

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setProcessing(true);
      // ১. ইমেজ ক্রপ করা
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // ২. ইমেজ কম্প্রেস করা (Quality Reduce)
      const compressionOptions = {
        maxSizeMB: 0.3, // সর্বোচ্চ 300KB
        maxWidthOrHeight: 800, // Flutter কার্ডে 304px, তাই 2x/3x স্ক্রিনের জন্য 800px যথেষ্ট
        useWebWorker: true,
        fileType: 'image/jpeg'
      };
      
      const compressedFile = await imageCompression(croppedBlob, compressionOptions);
      
      // ৩. অরিজিনাল ফাইলে কনভার্ট করে প্যারেন্টকে পাঠানো
      const file = new File([compressedFile], "feature_image.jpg", { type: "image/jpeg" });
      onCropComplete(file, URL.createObjectURL(file));
      
    } catch (e) {
      console.error(e);
      alert("Error cropping image");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Adjust Image</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="relative h-80 w-full bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_RATIO}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
          />
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3">
             <button 
               onClick={onCancel}
               className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
             >
               Cancel
             </button>
             <button 
               onClick={handleSave}
               disabled={processing}
               className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
             >
               {processing ? 'Processing...' : 'Crop & Save'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}