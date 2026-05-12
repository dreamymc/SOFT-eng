<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function addToCart(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'type_name' => 'required|string',
            'multiplier' => 'required|integer|min:1',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric' 
        ]);

        try {
            $user = auth()->user();
            
            $product = Product::findOrFail($request->product_id);
            $piecesNeeded = $request->quantity * $request->multiplier;

            // INJECTED: Fetch existing cart items for this product and calculate total pieces already reserved
            $existingCartItems = Cart::where('user_id', $user->id)
                                     ->where('product_id', $product->id)
                                     ->get();
                                     
            $existingPieces = $existingCartItems->sum(function($item) {
                return $item->quantity * $item->multiplier;
            });

            // INJECTED: Aggregate verification
            if ($product->stocks < ($piecesNeeded + $existingPieces)) {
                $available = max(0, $product->stocks - $existingPieces);
                return redirect()->back()
                    ->withErrors(['stock' => 'Insufficient stock'])
                    ->with('error', "Insufficient stock! You have {$existingPieces} pieces in cart. Only {$available} more base pieces available.");
            }

            $subtotal = $request->price * $piecesNeeded; 

            Cart::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'type_name' => $request->type_name,
                'multiplier' => $request->multiplier,
                'quantity' => $request->quantity,
                'subtotal' => $subtotal
            ]);

            return redirect()->back()->with('success', 'Item successfully added to cart.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['transaction' => 'Failed to add item'])
                ->with('error', 'Failed to add item to cart: ' . $e->getMessage());
        }
    }

    public function cart(){
        try {
            $user = auth()->user(); 
            $carts = Cart::with(['user','product'])->where('user_id',$user->id)->latest()->paginate(5);
            $total = Cart::where('user_id', $user->id)->sum('subtotal');

            return inertia('Customer/Cart',[
                'carts' => $carts,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['load' => 'Failed to load cart'])
                ->with('error', 'Failed to load cart.');
        }
    }

    public function checkout(Request $request){
        $fields = $request->validate([
            'cart_id' => 'required|array',
            'total' => 'required|numeric', 
            
            // New Customer & Delivery Fields
            'order_type' => 'required|in:Walk-in,Delivery',
            'customer_name' => 'nullable|string|max:255',
            'customer_address' => 'required_if:order_type,Delivery|nullable|string|max:500',
            
            // New Payment Method Fields
            'payment_method' => 'required|in:Cash,Gcash,Bank Transfer',
            'reference_number' => 'required_if:payment_method,Gcash,Bank Transfer|nullable|string|max:255',
            
            'cash_received' => 'required|numeric',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $user = auth()->user();

        if($fields['cash_received'] < $fields['total']){
            return redirect()->back()
                ->withErrors(['payment' => 'Insufficient payment'])
                ->with('error', "Insufficient payment received to complete transaction.");
        }

        try {
            DB::beginTransaction();
            
            // Determine initial order status based on the selected order type
            $initialStatus = ($fields['order_type'] === 'Delivery') ? 'To be delivered' : 'Completed - Shop';

            $store_order = Order::create([
                'user_id' => $user->id,
                'customer_name' => $fields['customer_name'] ?? null,
                'customer_address' => $fields['customer_address'] ?? null,
                'order_type' => $fields['order_type'],
                'payment_method' => $fields['payment_method'],
                'reference_number' => $fields['reference_number'] ?? null,
                'quantity' => 0, 
                'total' => $fields['total'],
                'discount_percentage' => $fields['discount_percentage'] ?? null,
                'discount_amount' => $fields['discount_amount'] ?? 0,
                'cash_recieved' => $fields['cash_received'],
                'change' => $fields['cash_received'] - $fields['total'],
                'order_status' => $initialStatus
            ]);
            
            $quantity = 0;

            foreach($fields['cart_id'] as $cart_id){
                $cart = Cart::findOrFail($cart_id);
                $quantity += $cart->quantity; 

                $product = Product::findOrFail($cart->product_id);
                $totalPiecesToDeduct = $cart->quantity * $cart->multiplier;

                // FEFO (First Expired, First Out) Logic with Pessimistic Locking
                $activeBatches = ProductBatch::where('product_id', $product->id)
                    ->where('status', 'active')
                    ->lockForUpdate()
                    ->orderByRaw('ISNULL(expires_at), expires_at ASC') 
                    ->get();

                $remainingToDeduct = $totalPiecesToDeduct;
                $usedBatchIds = [];

                foreach ($activeBatches as $batch) {
                    if ($remainingToDeduct <= 0) break;

                    $usedBatchIds[] = "#" . str_pad($batch->id, 3, '0', STR_PAD_LEFT);

                    if ($batch->quantity <= $remainingToDeduct) {
                        $remainingToDeduct -= $batch->quantity;
                        $batch->update(['quantity' => 0, 'status' => 'fully_sold']);
                    } else {
                        $batch->update(['quantity' => $batch->quantity - $remainingToDeduct]);
                        $remainingToDeduct = 0;
                    }
                }

                // Guard against Ghost Deductions
                if ($remainingToDeduct > 0) {
                    throw new \Exception("Not enough active batch stock for {$product->product_name}.");
                }

                OrderDetail::create([
                    'order_id' => $store_order->id,
                    'product_id' => $cart->product_id,
                    'user_id' => $user->id,
                    'type_name' => $cart->type_name,     
                    'multiplier' => $cart->multiplier,   
                    'quantity' => $cart->quantity,
                    'total' => $cart->subtotal,
                    'batch_ids' => implode(', ', $usedBatchIds),
                ]);
            }

            $updateOrder = Order::where('id',$store_order->id)->update([
                'quantity' => $quantity,
            ]);

            if($updateOrder){
                Cart::where('user_id',$user->id)->delete();
                DB::commit();
                return redirect()->route('customer.invoice',['order_id' => $store_order->id])->with('success', 'Transaction completed successfully.');
            }else{
                throw new \Exception("Failed to update final order quantity.");
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['transaction' => 'Transaction failed'])
                ->with('error', "Transaction failed: " . $e->getMessage());
        }
    }

    public function invoice($order_id){
        try {
            $order = Order::findOrFail($order_id);
            $orderDetails = OrderDetail::with(['product','user'])->where('order_id',$order_id)->get();

            return inertia('InvoiceReceipt',[
                'order' => $order,
                'orderDetails' => $orderDetails,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['invoice' => 'Not found'])
                ->with('error', 'Invoice not found or unavailable.');
        }
    }

    public function downloadInvoice($order_id){
        try {
            $order = Order::findOrFail($order_id);
            $orderDetails = OrderDetail::with(['product','user'])->where('order_id',$order_id)->get();

            return inertia('Admin/InvoiceReceipt',[
                'order' => $order,
                'orderDetails' => $orderDetails,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['invoice' => 'Not found'])
                ->with('error', 'Invoice not found or unavailable.');
        }
    }

    public function removeItem($cart_id){
        try {
            $user = auth()->user();
            $deleteItem = Cart::where('user_id',$user->id)->where('id',$cart_id)->delete();

            if($deleteItem){
                return redirect()->back()->with('success', 'Item voided from cart.');
            }else{
                return redirect()->back()
                    ->withErrors(['item' => 'Failed to remove'])
                    ->with('error', 'Failed to remove item from cart. Item may not exist.');
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Exception occurred'])
                ->with('error', 'An error occurred while removing the item.');
        }
    }
}