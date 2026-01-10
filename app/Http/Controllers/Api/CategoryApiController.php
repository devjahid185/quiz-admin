<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryApiController extends Controller
{
    /**
     * Serialized category list
     */
    public function index()
    {
        $categories = Category::where('status', 1)
            ->orderBy('serial')
            ->with([
                'subCategories' => function ($q) {
                    $q->where('status', 1)
                      ->orderBy('serial')
                      ->with([
                          'quizzes' => function ($qq) {
                              $qq->where('status', 1)
                                 ->orderBy('serial');
                          }
                      ]);
                },
                'quizzes' => function ($q) {
                    $q->where('status', 1);
                }
            ])
            ->get()
            ->map(function ($cat) {

                return [
                    'id' => $cat->id,
                    'title' => $cat->title,
                    'description' => $cat->description,
                    'image' => $cat->image
                        ? asset('storage/' . $cat->image)
                        : null,
                    'serial' => $cat->serial,

                    // ✅ Category level quiz count
                    'total_quizzes' => $cat->quizzes->count(),

                    // ✅ Sub Categories
                    'sub_categories' => $cat->subCategories->map(function ($sub) {
                        return [
                            'id' => $sub->id,
                            'title' => $sub->title,
                            'serial' => $sub->serial,

                            // ✅ Sub category quiz count
                            'total_quizzes' => $sub->quizzes->count(),

                            // ✅ Quiz list
                            'quizzes' => $sub->quizzes->map(function ($quiz) {
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
                                ];
                            })
                        ];
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}
