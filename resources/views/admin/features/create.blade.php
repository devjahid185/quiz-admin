@extends('admin.layout')
@section('title', 'Add Feature')

@section('content')
<div class="container mx-auto py-8 max-w-3xl">
    
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Add Feature</h1>
        <a href="{{ route('admin.features.index') }}" class="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to List
        </a>
    </div>

    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="p-6 bg-gray-50 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Feature Details</h3>
            <p class="text-sm text-gray-500 mt-1">Please fill in the information below.</p>
        </div>

        <form method="POST" enctype="multipart/form-data" action="{{ route('admin.features.store') }}" class="p-6 md:p-8 space-y-6">
            @csrf

            <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Feature Title <span class="text-red-500">*</span></label>
                <input type="text" name="title" required 
                       class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" 
                       placeholder="e.g. Premium Support">
            </div>

            <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Description</label>
                <textarea name="description" rows="4" 
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" 
                          placeholder="Write a short description about this feature..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Status</label>
                    <select name="status" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Serial / Order</label>
                    <input type="number" name="serial" 
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200 placeholder-gray-400" 
                           placeholder="e.g. 10">
                </div>
            </div>

            <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Feature Image</label>
                
                <div id="preview-container" class="hidden mb-4">
                    <div class="relative inline-block">
                        <img id="image-preview" src="#" alt="Preview" class="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" />
                        <span class="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white rounded-full p-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </span>
                    </div>
                </div>

                <div class="flex items-center justify-center w-full">
                    <label for="file-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200 hover:border-indigo-400">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p class="mb-2 text-sm text-gray-500"><span class="font-semibold text-indigo-600">Click to upload</span> or drag and drop</p>
                            <p class="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                        </div>
                        <input id="file-upload" name="image" type="file" class="hidden" accept="image/*" onchange="previewImage(event)" />
                    </label>
                </div>
            </div>

            <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <a href="{{ route('admin.features.index') }}" class="text-gray-700 bg-white border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gray-50 transition">
                    Cancel
                </a>
                <button type="submit" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md hover:shadow-lg transition transform hover:scale-105">
                    Save Feature
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    function previewImage(event) {
        const reader = new FileReader();
        reader.onload = function(){
            const output = document.getElementById('image-preview');
            output.src = reader.result;
            document.getElementById('preview-container').classList.remove('hidden');
        };
        if(event.target.files[0]){
            reader.readAsDataURL(event.target.files[0]);
        }
    }
</script>
@endsection
