<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\EmployeeMiddleware;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Index');
})->name('customer.index');

// INJECTED: Laravel's default Auth middleware mathematically requires a named 'login' route to exist.
// If an unauthenticated user tries to breach a protected route, Laravel redirects them here.
// Without this, the server throws a 500 error trying to find where to bounce them.
Route::get('/login', function () {
    return redirect()->route('customer.index');
})->name('login');

Route::post('/authentication', [UserController::class,'authentication'])
->name('customer.authentication');

// --- DELIVERY PERSONNEL ROUTES ---
Route::middleware(['auth', 'delivery'])->prefix('delivery')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\OrderController::class, 'deliveryDashboard'])->name('delivery.dashboard');
    Route::get('/orders/{id}', [App\Http\Controllers\OrderController::class, 'deliveryDetails'])->name('delivery.details');
    Route::get('/orders/{id}/confirm', [App\Http\Controllers\OrderController::class, 'showDeliveryForm'])->name('delivery.confirm.show');
    Route::post('/orders/{id}/confirm', [App\Http\Controllers\OrderController::class, 'storeDeliveryProof'])->name('delivery.confirm.store');
});

Route::middleware(['auth', EmployeeMiddleware::class])->group(function () {

    Route::get('/employee/deliveries', [App\Http\Controllers\OrderController::class, 'deliveriesList'])->name('employee.deliveries');
    Route::get('/orders/{id}/confirm-delivery', [App\Http\Controllers\OrderController::class, 'showDeliveryForm'])->name('orders.delivery_confirm.show');
    Route::post('/orders/{id}/confirm-delivery', [App\Http\Controllers\OrderController::class, 'storeDeliveryProof'])->name('orders.delivery_confirm.store');

    Route::get('/product', [ProductController::class,'displayProduct'])->name('customer.product');
    Route::get('/product/showProduct/{product_id}', [ProductController::class,'showProduct'])->name('customer.showProduct');
    Route::post('/product/showProduct/addToCart', [CartController::class,'addToCart'])->name('customer.addToCart'); 

    Route::get('/cart', [CartController::class,'cart'])->name('customer.cart');
    Route::get('/cart/removeItem/{cart_id}', [CartController::class,'removeItem'])->name('customer.removeItem');
    Route::post('/cart/checkout', [CartController::class,'checkout'])->name('customer.checkout');
    Route::get('/cart/checkout/invoice/{order_id}', [CartController::class,'invoice'])->name('customer.invoice');

    Route::get('/profile', [UserController::class,'customer_profile'])->name('customer.profile');
    Route::post('/profile/updateProfileInfo',[UserController::class,'updateProfileInfo'])->name('customer.updateProfileInfo');
    Route::post('/profile/updateProfilePassword',[UserController::class,'updateProfilePassword'])->name('customer.updateProfilePassword');

    Route::get('/orders', [OrderController::class,'orders'])->name('customer.orders');
    
    // INJECTED: Route for Cashier to confirm payment after delivery drop-off
    Route::post('/orders/{id}/finalize-payment', [OrderController::class, 'finalizePayment'])->name('customer.orders.finalizePayment');

    Route::post('/orders/return', [App\Http\Controllers\ReturnController::class, 'store'])->name('customer.return.store');
    
    Route::post('/employee/logout', [UserController::class,'employeeLogout'])->name('employee.logout');
});

// Admin group inclusion
require __DIR__ . '/admin.php';

// THE NEW ATTENDANCE ROUTE (Appended to the Admin level logic securely)
Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    Route::post('/admin/employee/attendance', [UserController::class, 'storeAttendance'])->name('employee.storeAttendance');
});