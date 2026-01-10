<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FeatureQuiz;
use App\Models\Features;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminFeatureQuizApiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $query = FeatureQuiz::with(['feature'])->orderBy('serial');
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('quiz_title', 'like', "%$search%")
                  ->orWhere('question', 'like', "%$search%")
                  ->orWhere('option_1', 'like', "%$search%")
                  ->orWhere('option_2', 'like', "%$search%")
                  ->orWhere('option_3', 'like', "%$search%")
                  ->orWhere('option_4', 'like', "%$search%")
                  ->orWhere('correct_answer', 'like', "%$search%")
                  ->orWhereHas('feature', function($q) use ($search) {
                      $q->where('title', 'like', "%$search%");
                  });
        }
        
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
            'feature_id' => 'required|exists:features,id',
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
            $imagePath = $request->file('image')->store('feature-quizzes', 'public');
        }

        $quiz = FeatureQuiz::create([
            'feature_id' => $data['feature_id'],
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

        $quiz->load(['feature']);
        return response()->json(['success' => true, 'data' => $quiz], 201);
    }

    public function show(FeatureQuiz $featureQuiz)
    {
        $featureQuiz->load(['feature']);
        return response()->json(['success' => true, 'data' => $featureQuiz]);
    }

    public function update(Request $request, FeatureQuiz $featureQuiz)
    {
        $data = $request->validate([
            'feature_id' => 'required|exists:features,id',
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
            if ($featureQuiz->image) {
                Storage::disk('public')->delete($featureQuiz->image);
            }
            $featureQuiz->image = $request->file('image')->store('feature-quizzes', 'public');
        }

        $featureQuiz->update([
            'feature_id' => $data['feature_id'],
            'quiz_title' => $data['quiz_title'],
            'question' => $data['question'] ?? $featureQuiz->question,
            'option_1' => $data['option_1'] ?? $featureQuiz->option_1,
            'option_2' => $data['option_2'] ?? $featureQuiz->option_2,
            'option_3' => $data['option_3'] ?? $featureQuiz->option_3,
            'option_4' => $data['option_4'] ?? $featureQuiz->option_4,
            'correct_answer' => $data['correct_answer'] ?? $featureQuiz->correct_answer,
            'status' => $data['status'] ?? $featureQuiz->status,
            'serial' => $data['serial'] ?? $featureQuiz->serial,
        ]);

        $featureQuiz->load(['feature']);
        return response()->json(['success' => true, 'data' => $featureQuiz]);
    }

    public function destroy(FeatureQuiz $featureQuiz)
    {
        if ($featureQuiz->image) {
            Storage::disk('public')->delete($featureQuiz->image);
        }
        $featureQuiz->delete();
        return response()->json(['success' => true]);
    }

    public function sort(Request $request)
    {
        $request->validate(['order' => 'required|array']);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                FeatureQuiz::where('id', $id)->update(['serial' => $index + 1]);
            }
        });

        return response()->json(['success' => true, 'message' => 'Feature quiz order updated']);
    }

    public function import(Request $request)
    {
        $data = $request->json()->all();
        if (!is_array($data)) {
            return response()->json(['success' => false, 'message' => 'Invalid JSON payload, expected an array of feature quizzes.'], 422);
        }

        $created = [];
        $errors = [];

        foreach ($data as $index => $item) {
            $validator = \Illuminate\Support\Facades\Validator::make($item, [
                'feature_id' => 'required|exists:features,id',
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

            $q = FeatureQuiz::create([
                'feature_id' => $item['feature_id'],
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