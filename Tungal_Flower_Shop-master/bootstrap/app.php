<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'employee' => \App\Http\Middleware\EmployeeMiddleware::class,
            'delivery' => \App\Http\Middleware\DeliveryMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Intercept all HTTP exceptions and force Laravel to return a beautiful Inertia React component 
        // instead of the raw, unformatted PHP error trace or standard HTML error pages.
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            $statusCodes = [400, 401, 403, 404, 500, 503];
            
            if (in_array($response->getStatusCode(), $statusCodes)) {
                return Inertia::render('Error', [
                    'status' => $response->getStatusCode()
                ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'error' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })->create();