@extends('admin.layout')
@section('title', 'Edit Category')

@section('content')
<div class="container mx-auto py-8 max-w-3xl">
    
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Edit Category: <span class="text-indigo-600">{{ $category->title }}</span></h1>
        <a href="{{ route('admin.categories.index') }}" class="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center transition duration-150">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to List
        </a>
    </div>

    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="p-6 bg-gray-50 border-b border-gray-100">
             <h3 class="text-lg font-semibold text-gray-900">Edit Details</h3>
        </div>

        <form method="POST" enctype="multipart/form-data" action="{{ route('admin.categories.update', $category->id) }}" class="p-6 md:p-8 space-y-6">
            @csrf @method('PUT')

            <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Category Title</label>
                <input type="text" name="title" value="{{ $category->title }}" required 
                       class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
            </div>

            <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Description</label>
                <textarea name="description" rows="4" 
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">{{ $category->description }}</textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Status</label>
                    <select name="status" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
                        <option value="1" @selected($category->status)>Active</option>
                        <option value="0" @selected(!$category->status)>Inactive</option>
                    </select>
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Serial / Order</label>
                    <input type="number" name="serial" value="{{ $category->serial }}" 
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition duration-200">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                
                <div class="md:col-span-1">
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Image Preview</label>
                    <div class="bg-white p-2 rounded-lg border border-gray-200 shadow-sm inline-block">
                        <img id="edit-image-preview" 
                             src="{{ $category->image ? asset('storage/'.$category->image) : 'https://via.placeholder.com/150?text=No+Image' }}" 
                             class="h-32 w-32 object-cover rounded-md">
                    </div>
                </div>

                <div class="md:col-span-2">
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Update Image</label>
                    <input type="file" name="image" accept="image/*" onchange="editPreviewImage(event)"
                           class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none focus:border-indigo-500 p-2.5">
                    <p class="mt-1 text-xs text-gray-500">Leave empty to keep current image. Supported: JPG, PNG, GIF.</p>
                </div>
            </div>

            <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <a href="{{ route('admin.categories.index') }}" class="text-gray-700 bg-white border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center hover:bg-gray-50 transition">
                    Cancel
                </a>
                <button type="submit" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-md hover:shadow-lg transition transform hover:scale-105">
                    Update Changes
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    function editPreviewImage(event) {
        const reader = new FileReader();
        reader.onload = function(){
            const output = document.getElementById('edit-image-preview');
            output.src = reader.result;
        };
        if(event.target.files[0]){
            reader.readAsDataURL(event.target.files[0]);
        }
    }
</script>
@endsection