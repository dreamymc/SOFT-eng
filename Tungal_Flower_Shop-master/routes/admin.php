<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ApprovalController; // Ensure you have this when we build it
use Illuminate\Support\Facades\Route; 

Route::middleware(['auth',AdminMiddleware::class])->group(function () {

    Route::get('/admin/payroll', [App\Http\Controllers\UserController::class, 'payroll'])->name('admin.payroll');
    Route::post('/admin/payroll/store', [App\Http\Controllers\UserController::class, 'storePayroll'])->name('admin.storePayroll');
    Route::put('/admin/payroll/update/{id}', [App\Http\Controllers\UserController::class, 'updatePayroll'])->name('admin.updatePayroll');

    // Admin Routes
    Route::get('/admin/dashboard', [UserController::class,'dashboard'])
    ->name('admin.dashboard');

    Route::get('/admin/returns', [App\Http\Controllers\ReturnController::class, 'index'])->name('admin.returns');

    // ----------------------------------------------------------------------------
    // Approvals Routes
    // Maps exactly to the workflow discussed. Note: we will need to create the ApprovalController next.
    Route::get('/admin/approvals', [ApprovalController::class, 'index'])->name('admin.approvals');
    Route::put('/admin/approvals/payroll/{id}/{action}', [ApprovalController::class, 'handlePayroll'])->name('admin.approvals.payroll');
    Route::put('/admin/approvals/return/{id}/{action}', [ApprovalController::class, 'handleReturn'])->name('admin.approvals.return');

    // ----------------------------------------------------------------------------

    // Sales-Features Routes
    Route::get('/admin/sales/{order_id?}', [UserController::class,'sales'])
    ->name('admin.sales');

    Route::get('/admin/sales/invoice/{order_id}', [CartController::class,'downloadInvoice'])
    ->name('admin.invoice');

    Route::post('/admin/sales/searchedOrderID', [UserController::class,'searchedOrderID'])
    ->name('admin.searchedOrderID');

    Route::get('/admin/sales/selectedEmployee/{user_id}', [UserController::class,'selectedEmployee'])
    ->name('admin.selectedEmployee');

    // ----------------------------------------------------------------------------

    Route::get('/admin/inventory', [ProductController::class,'showInventoryProduct'])
    ->name('admin.inventory');

    Route::get('/admin/employee', [UserController::class,'displayEmployee'])
    ->name('admin.employee');

    // ----------------------------------------------------------------------------
    // Admin-Features Routes
    Route::get('/admin/profile', [UserController::class,'adminProfile'])
    ->name('admin.profile');

    Route::post('/admin/profile/updateAdminInfo',[UserController::class,'updateAdminInfo'])
    ->name('admin.updateAdminInfo');

    Route::post('/admin/profile/updateAdminPassword',[UserController::class,'updateAdminPassword'])
    ->name('admin.updateAdminPassword');

    // ----------------------------------------------------------------------------
    // Employee-Feature Routes

    Route::post('/admin/employee/addEmployee/store',[UserController::class,'storeEmployeeData'])->name('employee.storeEmployeeData');

    Route::get('/admin/employee/viewProfile/{user_id}', [UserController::class,'viewEmployeeProfile'])
    ->name('employee.viewProfile');

    Route::post('/admin/employee/viewProfile/updateUserInfo',[UserController::class,'updateUserInfo'])->name('employee.updateUserInfo');

    Route::post('/admin/employee/viewProfile/updatePassword',[UserController::class,'updatePassword'])->name('employee.updatePassword');

    Route::delete('/admin/employee/fire/{id}', [UserController::class, 'fireEmployee'])->name('admin.employee.destroy');

    // ----------------------------------------------------------------------------

    // Inventory-Feature Routes
    Route::get('/admin/inventory/addProduct', function () {
        return inertia('Admin/Inventory_Features/AddProduct');
    })->name('inventory.addProduct');

    Route::post('/admin/inventory/addProduct/store',[ProductController::class,'storeProduct'])->name('inventory.storeProduct');

    // --- BATCH MANAGEMENT ROUTES ---
    Route::post('/admin/batches', [ProductController::class, 'storeBatch'])->name('admin.batches.store');
    Route::delete('/admin/batches/{id}', [ProductController::class, 'destroyBatch'])->name('admin.batches.destroy');

    Route::get('/admin/inventory/viewProduct/{product_id}', [ProductController::class,'viewProduct'])
    ->name('inventory.viewProduct');

    Route::post('/admin/inventory/viewProduct/updateProduct',[ProductController::class,'updateProduct'])
    ->name('inventory.updateProduct');
    // ----------------------------------------------------------------------------

    // REPLACED: Pointing this directly to the proven 'employeeLogout' function to definitively destroy the session.
    // Removed the 'withoutMiddleware' override so it properly handles the authenticated user termination.
    Route::post('/admin/logout', [UserController::class,'employeeLogout'])
    ->name('admin.logout');
});
