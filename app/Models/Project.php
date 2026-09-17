<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    protected $fillable = ['category_id', 'title', 'slug', 'description', 'client_name', 'cover_image', 'project_date', 'is_published'];
    
    public function category() {
        return $this->belongsTo(Category::class);
    }
    
    public function images() {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }
}
