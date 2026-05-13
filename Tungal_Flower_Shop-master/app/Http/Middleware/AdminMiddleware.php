<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Allow Admin, Manager, and Owner to access the Admin dashboards
        if (in_array(auth()->user()->role, ['Admin', 'Manager', 'Owner'])) {
            return $next($request);
        }
        
        abort(403, 'Forbidden - no permission');
    }
}