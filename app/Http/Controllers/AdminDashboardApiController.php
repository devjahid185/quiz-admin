<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Features;
use App\Models\FeatureQuiz;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class AdminDashboardApiController extends Controller
{
    public function statistics()
    {
        try {
            // Basic Counts
        $totalUsers = User::count();
        $totalQuizzes = Quiz::count();
        $totalQuestions = Question::count();
        $totalCategories = Category::count();
        $totalSubCategories = SubCategory::count();
        $totalFeatures = Features::count();
        $totalFeatureQuizzes = FeatureQuiz::count();

        // Active/Inactive Counts
        $activeQuizzes = Quiz::where('status', 1)->count();
        $inactiveQuizzes = Quiz::where('status', 0)->count();
        $activeCategories = Category::where('status', 1)->count();
        $blockedUsers = User::where('blocked', 1)->count();
        $activeUsers = User::where('blocked', 0)->count();

        // Recent Data (Last 7 days)
        $recentUsers = User::where('created_at', '>=', now()->subDays(7))->count();
        $recentQuizzes = Quiz::where('created_at', '>=', now()->subDays(7))->count();
        $recentQuestions = Question::where('created_at', '>=', now()->subDays(7))->count();

        // Today's Data
        $todayUsers = User::whereDate('created_at', today())->count();
        $todayQuizzes = Quiz::whereDate('created_at', today())->count();
        $todayQuestions = Question::whereDate('created_at', today())->count();

        // Category Distribution
        $categoryDistribution = Category::withCount('quizzes')
            ->orderBy('quizzes_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->title,
                    'count' => $category->quizzes_count,
                ];
            });

        // Difficulty Level Distribution
        $difficultyDistribution = [];
        try {
            // Check if difficulty_level column exists
            $hasDifficultyColumn = Schema::hasColumn('questions', 'difficulty_level');
            if ($hasDifficultyColumn) {
                $difficultyDistribution = Question::select('difficulty_level', DB::raw('count(*) as count'))
                    ->whereNotNull('difficulty_level')
                    ->groupBy('difficulty_level')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'level' => ucfirst($item->difficulty_level),
                            'count' => $item->count,
                        ];
                    })->toArray();
            }
        } catch (\Exception $e) {
            // If column doesn't exist, return empty array
            $difficultyDistribution = [];
        }

        // Daily Growth (Last 30 days)
        $dailyGrowth = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dailyGrowth[] = [
                'date' => $date,
                'users' => User::whereDate('created_at', $date)->count(),
                'quizzes' => Quiz::whereDate('created_at', $date)->count(),
                'questions' => Question::whereDate('created_at', $date)->count(),
            ];
        }

        // Recent Users
        $recentUsersList = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at', 'blocked', 'coin_balance']);

        // Recent Quizzes
        $recentQuizzesList = Quiz::with(['category', 'subCategory'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'quiz_title', 'status', 'created_at', 'category_id', 'sub_category_id']);

        // Recent Questions
        $recentQuestionsList = [];
        try {
            $hasCategoryColumn = Schema::hasColumn('questions', 'category_id');
            $hasDifficultyColumn = Schema::hasColumn('questions', 'difficulty_level');
            $hasQuestionTextColumn = Schema::hasColumn('questions', 'question_text');
            
            $selectFields = ['id', 'created_at'];
            if ($hasQuestionTextColumn) {
                $selectFields[] = 'question_text';
            } else {
                $selectFields[] = 'question';
            }
            if ($hasDifficultyColumn) {
                $selectFields[] = 'difficulty_level';
            }
            if ($hasCategoryColumn) {
                $selectFields[] = 'category_id';
            }
            
            $query = Question::orderBy('created_at', 'desc')->limit(5);
            if ($hasCategoryColumn) {
                $query->with(['category']);
            }
            $recentQuestionsList = $query->get($selectFields);
        } catch (\Exception $e) {
            // If there's an error, try without relationships
            $recentQuestionsList = Question::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'question', 'created_at']);
        }

        // Total Balance
        $totalCoinBalance = User::sum('coin_balance');
        $totalMainBalance = User::sum('main_balance');

        // Top Categories by Quiz Count
        $topCategories = Category::withCount('quizzes')
            ->orderBy('quizzes_count', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'status']);

        return response()->json([
            'success' => true,
            'data' => [
                'counts' => [
                    'total_users' => $totalUsers,
                    'total_quizzes' => $totalQuizzes,
                    'total_questions' => $totalQuestions,
                    'total_categories' => $totalCategories,
                    'total_sub_categories' => $totalSubCategories,
                    'total_features' => $totalFeatures,
                    'total_feature_quizzes' => $totalFeatureQuizzes,
                    'active_quizzes' => $activeQuizzes,
                    'inactive_quizzes' => $inactiveQuizzes,
                    'active_categories' => $activeCategories,
                    'active_users' => $activeUsers,
                    'blocked_users' => $blockedUsers,
                ],
                'recent' => [
                    'last_7_days' => [
                        'users' => $recentUsers,
                        'quizzes' => $recentQuizzes,
                        'questions' => $recentQuestions,
                    ],
                    'today' => [
                        'users' => $todayUsers,
                        'quizzes' => $todayQuizzes,
                        'questions' => $todayQuestions,
                    ],
                ],
                'balances' => [
                    'total_coin_balance' => (float) $totalCoinBalance,
                    'total_main_balance' => (float) $totalMainBalance,
                ],
                'distributions' => [
                    'categories' => $categoryDistribution,
                    'difficulty_levels' => $difficultyDistribution,
                ],
                'growth' => $dailyGrowth,
                'recent_lists' => [
                    'users' => $recentUsersList,
                    'quizzes' => $recentQuizzesList,
                    'questions' => $recentQuestionsList,
                ],
                'top_categories' => $topCategories->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'title' => $cat->title,
                        'quizzes_count' => $cat->quizzes_count,
                        'status' => $cat->status,
                    ];
                }),
            ],
        ]);
        } catch (\Exception $e) {
            Log::error('Dashboard statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error loading statistics: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }
}
