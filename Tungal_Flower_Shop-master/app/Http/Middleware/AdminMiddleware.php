<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Allow Admin, Manager, and Owner to access the Admin dashboards
        if (auth()->check() && in_array(auth()->user()->role, ['Admin', 'Manager', 'Owner'])) {
            return $next($request);
        }
        abort(403, 'Forbidden - no permission');
    }
}