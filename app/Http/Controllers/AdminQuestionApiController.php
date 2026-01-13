<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class AdminQuestionApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Question::with(['category'])->orderBy('id', 'desc');
        
        // Category filter
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('question_text', 'like', "%$search%")
                  ->orWhere('option_a', 'like', "%$search%")
                  ->orWhere('option_b', 'like', "%$search%")
                  ->orWhere('option_c', 'like', "%$search%")
                  ->orWhere('option_d', 'like', "%$search%")
                  ->orWhere('correct_option', 'like', "%$search%");
            });
        }
        
        // Difficulty filter
        if ($request->has('difficulty_level') && $request->difficulty_level) {
            $query->where('difficulty_level', $request->difficulty_level);
        }
        
        // Pagination
        $perPage = $request->input('per_page', 10);
        $questions = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $questions->items(),
            'pagination' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_option' => 'required|in:a,b,c,d,A,B,C,D',
            'category_id' => 'nullable|exists:categories,id',
            'difficulty_level' => 'nullable|string|in:easy,medium,hard',
        ]);

        $question = Question::create([
            'question_text' => $data['question_text'],
            'option_a' => $data['option_a'],
            'option_b' => $data['option_b'],
            'option_c' => $data['option_c'],
            'option_d' => $data['option_d'],
            'correct_option' => strtolower($data['correct_option']),
            'category_id' => $data['category_id'] ?? null,
            'difficulty_level' => $data['difficulty_level'] ?? null,
        ]);

        $question->load(['category']);
        return response()->json(['success' => true, 'data' => $question], 201);
    }

    public function show(Question $question)
    {
        $question->load(['category']);
        return response()->json(['success' => true, 'data' => $question]);
    }

    public function update(Request $request, Question $question)
    {
        $data = $request->validate([
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_option' => 'required|in:a,b,c,d,A,B,C,D',
            'category_id' => 'nullable|exists:categories,id',
            'difficulty_level' => 'nullable|string|in:easy,medium,hard',
        ]);

        $question->update([
            'question_text' => $data['question_text'],
            'option_a' => $data['option_a'],
            'option_b' => $data['option_b'],
            'option_c' => $data['option_c'],
            'option_d' => $data['option_d'],
            'correct_option' => strtolower($data['correct_option']),
            'category_id' => $data['category_id'] ?? $question->category_id,
            'difficulty_level' => $data['difficulty_level'] ?? $question->difficulty_level,
        ]);

        $question->load(['category']);
        return response()->json(['success' => true, 'data' => $question]);
    }

    public function destroy(Question $question)
    {
        $question->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Import questions from a JSON array. Each item should be an object with keys:
     * question_text, option_a, option_b, option_c, option_d, correct_option, category_id (optional), difficulty_level (optional)
     */
    public function import(Request $request)
    {
        $data = $request->json()->all();
        if (!is_array($data)) {
            return response()->json(['success' => false, 'message' => 'Invalid JSON payload, expected an array of questions.'], 422);
        }

        $created = [];
        $errors = [];

        foreach ($data as $index => $item) {
            $validator = \Illuminate\Support\Facades\Validator::make($item, [
                'question_text' => 'required|string',
                'option_a' => 'required|string',
                'option_b' => 'required|string',
                'option_c' => 'required|string',
                'option_d' => 'required|string',
                'correct_option' => 'required|in:a,b,c,d,A,B,C,D',
                'category_id' => 'nullable|exists:categories,id',
                'difficulty_level' => 'nullable|string|in:easy,medium,hard',
            ]);

            if ($validator->fails()) {
                $errors[$index] = $validator->errors()->messages();
                continue;
            }

            $q = Question::create([
                'question_text' => $item['question_text'],
                'option_a' => $item['option_a'],
                'option_b' => $item['option_b'],
                'option_c' => $item['option_c'],
                'option_d' => $item['option_d'],
                'correct_option' => strtolower($item['correct_option']),
                'category_id' => $item['category_id'] ?? null,
                'difficulty_level' => $item['difficulty_level'] ?? null,
            ]);

            $created[] = $q;
        }

        $status = count($errors) ? 207 : 201;
        return response()->json(['success' => true, 'created' => $created, 'errors' => $errors], $status);
    }
}
