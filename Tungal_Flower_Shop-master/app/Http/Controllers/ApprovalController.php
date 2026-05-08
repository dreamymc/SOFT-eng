<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payroll;
use App\Models\ReturnRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    /**
     * Display the Approvals Hub
     */
    public function index()
    {
        $pendingPayrolls = Payroll::with('employee')
            ->where('status', 'Pending')
            ->latest()
            ->get();

        $pendingReturns = ReturnRequest::with(['order.details.product', 'cashier'])
            ->where('status', 'Under Inspection')
            ->latest()
            ->get()
            ->map(function ($return) {
                // Safely calculate refund amount based on order total
                $return->refund_amount = $return->order ? $return->order->total : 0;
                
                // Accurately calculate total returned pieces using the multiplier
                $totalPieces = 0;
                if ($return->order && $return->order->details) {
                    foreach ($return->order->details as $detail) {
                        $totalPieces += ($detail->quantity * ($detail->multiplier ?? 1));
                    }
                }
                $return->total_quantity = $totalPieces;

                return $return;
            });

        return inertia('Admin/Approvals', [
            'pendingPayrolls' => $pendingPayrolls,
            'pendingReturns' => $pendingReturns
        ]);
    }

    /**
     * Handle Payroll Approvals & Rejections
     */
    public function handlePayroll(Request $request, $id, $action)
    {
        // 404 mapped gap: findOrFail throws a strict 404 if the record doesn't exist
        $payroll = Payroll::findOrFail($id);

        // 400 mapped gap: Prevent illogical state changes (approving an already approved payroll)
        if ($payroll->status !== 'Pending') {
            abort(400, 'Bad Request: Payroll has already been processed.');
        }

        if ($action === 'approve') {
            $payroll->update(['status' => 'Approved']);
            return redirect()->back()->with('success', 'Payroll has been successfully approved.');
        } 
        
        if ($action === 'reject') {
            $payroll->update(['status' => 'Rejected']);
            return redirect()->back()->with('success', 'Payroll has been rejected.');
        }

        // 400 mapped gap: Invalid action parameter provided in the URL
        abort(400, 'Bad Request: Invalid action specified.');
    }

    /**
     * Handle Return/Refund Approvals & Rejections
     */
    public function handleReturn(Request $request, $id, $action)
    {
        // 404 mapped gap: findOrFail throws a strict 404 if the record doesn't exist
        $returnRequest = ReturnRequest::with('order.details')->findOrFail($id);

        // 400 mapped gap: Prevent illogical state changes (rejecting an already rejected return)
        if ($returnRequest->status !== 'Under Inspection') {
            abort(400, 'Bad Request: Return request has already been processed.');
        }

        if ($action === 'approve') {
            DB::beginTransaction();
            try {
                // 1. Update the return request status
                $returnRequest->update(['status' => 'Approved']);
                
                // 2. Update the original Order's specific 'order_status' column
                if ($returnRequest->order) {
                    $returnRequest->order->update(['order_status' => 'Refunded']);
                }
                
                // FIXED: REMOVED THE AUTO-RESTOCKING LOOP
                // We rely on the Admin to manually check the physical flowers and restock them manually if usable.

                DB::commit();
                
                // Added a specific success message to remind them
                return redirect()->back()->with('success', 'Return approved and order updated. Remember to manually adjust inventory stocks if the items are reusable.');
            } catch (\Exception $e) {
                DB::rollBack();
                // 500 mapped gap: Transaction failed
                abort(500, 'Internal Server Error - Transaction failed: ' . $e->getMessage());
            }
        } 
        
        if ($action === 'reject') {
            DB::beginTransaction();
            try {
                // 1. Update the return request status
                $returnRequest->update(['status' => 'Rejected']);
                
                // 2. Revert the original Order 'order_status' back to Completed/Paid
                if ($returnRequest->order) {
                    $returnRequest->order->update(['order_status' => 'Completed']);
                }

                DB::commit();
                return redirect()->back()->with('success', 'Return request has been rejected and order status restored.');
            } catch (\Exception $e) {
                DB::rollBack();
                // 500 mapped gap: Transaction failed
                abort(500, 'Internal Server Error - Transaction failed: ' . $e->getMessage());
            }
        }

        // 400 mapped gap: Invalid action parameter provided in the URL
        abort(400, 'Bad Request: Invalid action specified.');
    }
}