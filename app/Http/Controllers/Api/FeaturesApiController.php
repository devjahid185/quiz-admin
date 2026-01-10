<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Features;

class FeaturesApiController extends Controller
{
    /**
     * Serialized feature list with quizzes
     */
    public function index()
    {
        $features = Features::where('status', 1)
            ->orderBy('serial', 'asc')
            ->with([
                'featureQuizzes' => function ($q) {
                    $q->where('status', 1)
                      ->orderBy('serial', 'asc');
                }
            ])
            ->get()
            ->map(function ($feature) {

                return [
                    'id'          => $feature->id,
                    'title'       => $feature->title,
                    'description' => $feature->description,
                    'image'       => $feature->image
                        ? asset('storage/' . $feature->image)
                        : null,
                    'serial'      => $feature->serial,

                    // ✅ Feature quiz count
                    'total_quizzes' => $feature->featureQuizzes->count(),

                    // ✅ Feature quizzes list
                    'quizzes' => $feature->featureQuizzes->map(function ($quiz) {
                        return [
                            'id' => $quiz->id,
                            'quiz_title' => $quiz->quiz_title,
                            'question' => $quiz->question,
                            'options' => [
                                $quiz->option_1,
                                $quiz->option_2,
                                $quiz->option_3,
                                $quiz->option_4,
                            ],
                            'correct_answer' => $quiz->correct_answer,
                            'image' => $quiz->image
                                ? asset('storage/' . $quiz->image)
                                : null,
                            'serial' => $quiz->serial,
                        ];
                    }),
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $features,
        ]);
    }
}
