<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function orders() {
        try {
            $orders = Order::with('details') 
                ->latest()
                ->paginate(10);
        
            return inertia('Customer/Orders', [
                'orders' => $orders,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load orders.');
        }
    }

    public function deliveriesList() 
    {
        try {
            $orders = \App\Models\Order::latest()->get();
            
            return inertia('Employee/Deliveries', [
                'orders' => $orders
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load delivery list.');
        }
    }
    
    public function showDeliveryForm($id) {
        try {
            $order = \App\Models\Order::findOrFail($id); 

            return inertia('Delivery/Confirm', [
                'order' => $order
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Delivery order not found.');
        }
    }

    public function storeDeliveryProof(Request $request, $id) {
        $request->validate(['proof_image' => 'required|image|max:5000']);
        
        try {
            $order = \App\Models\Order::findOrFail($id);
            
            if ($request->hasFile('proof_image')) {
                $path = $request->file('proof_image')->store('proofs', 'public');
                $order->update(['delivery_proof' => $path, 'order_status' => 'Delivered']);
            }
            
            return redirect()->route('delivery.dashboard')->with('success', 'Delivery proof uploaded successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to process delivery proof.');
        }
    }

    // Cashier confirms payment received from driver
    public function finalizePayment(Request $request, $id) {
        try {
            $order = Order::findOrFail($id);
            
            if ($order->order_status !== 'Delivered') {
                return redirect()->back()->with('error', 'Cannot finalize payment. Order is not marked as Delivered.');
            }

            $order->update(['order_status' => 'Completed - Delivered']);

            return redirect()->back()->with('success', 'Payment confirmed and order finalized.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to finalize payment.');
        }
    }

    // Loads the list of all orders
    public function deliveryDashboard() 
    {
        try {
            $orders = \App\Models\Order::latest()->get();
            return inertia('Delivery/Dashboard', ['orders' => $orders]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load dashboard data.');
        }
    }

    // Loads the specific details for one order
    public function deliveryDetails($id)
    {
        try {
            $order = \App\Models\Order::with('details.product')->findOrFail($id);
            return inertia('Delivery/Details', ['order' => $order]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Delivery details not found.');
        }
    }
}