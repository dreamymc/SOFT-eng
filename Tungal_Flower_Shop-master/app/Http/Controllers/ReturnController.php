<?php

namespace App\Http\Controllers;

use App\Models\ReturnRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReturnController extends Controller
{
    // Fetches all returns for the Admin Returns Page
    public function index()
    {
        try {
            // Eager load order, order details, and products to flatten the data for the UI
            $returns = ReturnRequest::with(['order.details.product', 'cashier'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return Inertia::render('Admin/Returns', [
                'returns' => $returns
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load return requests.');
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoiceNum' => 'required|string',
            'reason' => 'required|string',
            'method' => 'required|string',
        ]);

        try {
            $user = auth()->user();
            $rawOrderId = preg_replace('/[^0-9]/', '', $request->invoiceNum);
            
            $orderExists = Order::findOrFail($rawOrderId);
            
            // INJECTED: Privilege guard against unauthorized returns
            if ($orderExists->user_id !== $user->id && !in_array($user->role, ['Admin', 'Manager', 'Owner'])) {
                return redirect()->back()
                    ->withErrors(['return' => 'Unauthorized'])
                    ->with('error', 'Unauthorized: You can only request returns for your own transactions.');
            }

            $alreadyRequested = ReturnRequest::where('order_id', $rawOrderId)->exists();
            if ($alreadyRequested) {
                return redirect()->back()
                    ->withErrors(['return' => 'Duplicate'])
                    ->with('error', 'A return request for this order is already being processed.');
            }

            DB::beginTransaction();

            ReturnRequest::create([
                'order_id' => $rawOrderId,
                'user_id' => $user->id,
                'reason' => $request->reason,
                'refund_method' => $request->method,
                'status' => 'Under Inspection'
            ]);

            $orderExists->update(['order_status' => 'Refund Requested']);

            DB::commit();

            return redirect()->back()->with('success', 'Refund request confirmed and submitted successfully!');
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->back()
                ->withErrors(['return' => 'Not Found'])
                ->with('error', 'Invalid Order ID.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['return' => 'Failed'])
                ->with('error', 'An error occurred while submitting the return request.');
        }
    }
}