<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminQuizApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::with(['category','subCategory'])->orderBy('serial');
        // Category filter
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('quiz_title', 'like', "%$search%")
                  ->orWhere('question', 'like', "%$search%")
                  ->orWhere('option_1', 'like', "%$search%")
                  ->orWhere('option_2', 'like', "%$search%")
                  ->orWhere('option_3', 'like', "%$search%")
                  ->orWhere('option_4', 'like', "%$search%")
                  ->orWhere('correct_answer', 'like', "%$search%")
                ;
            });
        }
        // Pagination
        $perPage = $request->input('per_page', 10);
        $quizzes = $query->paginate($perPage);
        return response()->json([
            'success' => true,
            'data' => $quizzes->items(),
            'pagination' => [
                'current_page' => $quizzes->currentPage(),
                'last_page' => $quizzes->lastPage(),
                'per_page' => $quizzes->perPage(),
                'total' => $quizzes->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'quiz_title' => 'required|string',
            'question' => 'nullable|string',
            'option_1' => 'nullable|string',
            'option_2' => 'nullable|string',
            'option_3' => 'nullable|string',
            'option_4' => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'image' => 'nullable|image',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('quizzes', 'public');
        }

        $quiz = Quiz::create([
            'category_id' => $data['category_id'],
            'sub_category_id' => $data['sub_category_id'] ?? null,
            'quiz_title' => $data['quiz_title'],
            'question' => $data['question'] ?? null,
            'option_1' => $data['option_1'] ?? null,
            'option_2' => $data['option_2'] ?? null,
            'option_3' => $data['option_3'] ?? null,
            'option_4' => $data['option_4'] ?? null,
            'correct_answer' => $data['correct_answer'] ?? null,
            'image' => $imagePath,
            'status' => $data['status'] ?? 1,
            'serial' => $data['serial'] ?? 0,
        ]);

        $quiz->load(['category','subCategory']);
        return response()->json(['success' => true, 'data' => $quiz], 201);
    }

    public function show(Quiz $quiz)
    {
        $quiz->load(['category','subCategory']);
        return response()->json(['success' => true, 'data' => $quiz]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'quiz_title' => 'required|string',
            'question' => 'nullable|string',
            'option_1' => 'nullable|string',
            'option_2' => 'nullable|string',
            'option_3' => 'nullable|string',
            'option_4' => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'image' => 'nullable|image',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
        ]);

        if ($request->hasFile('image')) {
            if ($quiz->image) {
                Storage::disk('public')->delete($quiz->image);
            }
            $quiz->image = $request->file('image')->store('quizzes', 'public');
        }

        $quiz->update([
            'category_id' => $data['category_id'],
            'sub_category_id' => $data['sub_category_id'] ?? $quiz->sub_category_id,
            'quiz_title' => $data['quiz_title'],
            'question' => $data['question'] ?? $quiz->question,
            'option_1' => $data['option_1'] ?? $quiz->option_1,
            'option_2' => $data['option_2'] ?? $quiz->option_2,
            'option_3' => $data['option_3'] ?? $quiz->option_3,
            'option_4' => $data['option_4'] ?? $quiz->option_4,
            'correct_answer' => $data['correct_answer'] ?? $quiz->correct_answer,
            'status' => $data['status'] ?? $quiz->status,
            'serial' => $data['serial'] ?? $quiz->serial,
        ]);

        $quiz->load(['category','subCategory']);
        return response()->json(['success' => true, 'data' => $quiz]);
    }

    public function destroy(Quiz $quiz)
    {
        if ($quiz->image) {
            Storage::disk('public')->delete($quiz->image);
        }
        $quiz->delete();
        return response()->json(['success' => true]);
    }

    public function sort(Request $request)
    {
        $request->validate(['order' => 'required|array']);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                Quiz::where('id', $id)->update(['serial' => $index + 1]);
            }
        });

        return response()->json(['success' => true, 'message' => 'Quiz order updated']);
    }

    /**
     * Import quizzes from a JSON array. Each item should be an object with keys:
     * category_id, sub_category_id (optional), quiz_title, question, option_1..4, correct_answer, status, serial
     */
    public function import(Request $request)
    {
        $data = $request->json()->all();
        if (!is_array($data)) {
            return response()->json(['success' => false, 'message' => 'Invalid JSON payload, expected an array of quizzes.'], 422);
        }

        $created = [];
        $errors = [];

        foreach ($data as $index => $item) {
            $validator = \Illuminate\Support\Facades\Validator::make($item, [
                'category_id' => 'required|exists:categories,id',
                'sub_category_id' => 'nullable|exists:sub_categories,id',
                'quiz_title' => 'required|string',
                'question' => 'nullable|string',
                'option_1' => 'nullable|string',
                'option_2' => 'nullable|string',
                'option_3' => 'nullable|string',
                'option_4' => 'nullable|string',
                'correct_answer' => 'nullable|string',
                'status' => 'nullable|boolean',
                'serial' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                $errors[$index] = $validator->errors()->messages();
                continue;
            }

            $q = Quiz::create([
                'category_id' => $item['category_id'],
                'sub_category_id' => $item['sub_category_id'] ?? null,
                'quiz_title' => $item['quiz_title'],
                'question' => $item['question'] ?? null,
                'option_1' => $item['option_1'] ?? null,
                'option_2' => $item['option_2'] ?? null,
                'option_3' => $item['option_3'] ?? null,
                'option_4' => $item['option_4'] ?? null,
                'correct_answer' => $item['correct_answer'] ?? null,
                'image' => null,
                'status' => $item['status'] ?? 1,
                'serial' => $item['serial'] ?? 0,
            ]);

            $created[] = $q;
        }

        $status = count($errors) ? 207 : 201;
        return response()->json(['success' => true, 'created' => $created, 'errors' => $errors], $status);
    }
}
