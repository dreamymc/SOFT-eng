<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EmployeeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Allows Cashiers to access the POS. Admins and Managers are also added here so they can ring people up if needed.
        if (in_array(auth()->user()->role, ['Employee', 'Cashier', 'Manager', 'Admin', 'Owner'])) {
            return $next($request);
        }
        
        abort(403, 'Forbidden - no permission');
    }
}