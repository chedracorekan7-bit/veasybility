<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['category', 'images'])->where('is_published', true);
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        return response()->json($query->orderBy('project_date', 'desc')->get());
    }

    public function show($slug)
    {
        $project = Project::with(['category', 'images'])->where('slug', $slug)->firstOrFail();
        
        $previous = Project::where('is_published', true)->where('id', '<', $project->id)->orderBy('id', 'desc')->first();
        $next = Project::where('is_published', true)->where('id', '>', $project->id)->orderBy('id', 'asc')->first();
        
        return response()->json([
            'project' => $project,
            'previous' => $previous,
            'next' => $next
        ]);
    }
}
