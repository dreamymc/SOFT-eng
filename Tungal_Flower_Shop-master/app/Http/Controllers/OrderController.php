<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function orders() {
        // We dropped the 'user' relationship here to stop the crash.
        // It now only loads 'details' and fetches ALL orders globally.
        $orders = Order::with('details') 
            ->latest()
            ->paginate(10);
    
        return inertia('Customer/Orders', [
            'orders' => $orders,
        ]);
    }

    public function deliveriesList() 
    {
        $orders = \App\Models\Order::latest()->get();
        
        return inertia('Employee/Deliveries', [
            'orders' => $orders
        ]);
    }
    
    public function showDeliveryForm($id) {
        $order = \App\Models\Order::findOrFail($id); 

        return inertia('Delivery/Confirm', [
            'order' => $order
        ]);
    }

    public function storeDeliveryProof(Request $request, $id) {
        $request->validate(['proof_image' => 'required|image|max:5000']);
        
        $order = \App\Models\Order::findOrFail($id);
        
        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('proofs', 'public');
            // Marks the driver phase as complete
            $order->update(['delivery_proof' => $path, 'order_status' => 'Delivered']);
        }
        
        return redirect()->route('delivery.dashboard');
    }

    // INJECTED: Cashier confirms payment received from driver
    public function finalizePayment(Request $request, $id) {
        $order = Order::findOrFail($id);
        
        if ($order->order_status !== 'Delivered') {
            abort(400, 'Bad Request: Cannot finalize payment. Order is not marked as Delivered.');
        }

        $order->update(['order_status' => 'Completed - Delivered']);

        return redirect()->back()->with('success', 'Payment confirmed and order finalized.');
    }

    // Loads the list of all orders
    public function deliveryDashboard() 
    {
        $orders = \App\Models\Order::latest()->get();
        return inertia('Delivery/Dashboard', ['orders' => $orders]);
    }

    // Loads the specific details for one order
    public function deliveryDetails($id)
    {
        $order = \App\Models\Order::findOrFail($id);
        return inertia('Delivery/Details', ['order' => $order]);
    }
}