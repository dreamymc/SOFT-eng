<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeliveryMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $role = strtolower($user->role);
        switch($role){
            case 'delivery':
                return $next($request);
                break;
            default:
                abort(403, 'Forbidden - no permission');
        }
    }
}