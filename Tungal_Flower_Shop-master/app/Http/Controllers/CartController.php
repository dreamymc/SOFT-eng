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

        $user = auth()->user();
        
        // 404 mapped gap: Native Exception if Product doesn't exist
        $product = Product::findOrFail($request->product_id);

        $piecesNeeded = $request->quantity * $request->multiplier;

        if ($product->stocks < $piecesNeeded) {
            // 400 mapped gap: Explicitly blocking illogical requests with HTTP code
            abort(400, "Bad Request: Insufficient stock! Only {$product->stocks} base pieces available.");
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
    }

    public function cart(){
        $user = auth()->user(); 
        $carts = Cart::with(['user','product'])->where('user_id',$user->id)->latest()->paginate(5);
        $total = Cart::where('user_id', $user->id)->sum('subtotal');

        return inertia('Customer/Cart',[
            'carts' => $carts,
            'total' => $total
        ]);
    }

    public function checkout(Request $request){
        $fields = $request->validate([
            'cart_id' => 'required|array',
            'total' => 'required|numeric', 
            'cash_received' => 'required|numeric',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $user = auth()->user();

        if($fields['cash_received'] < $fields['total']){
            // 400 mapped gap: Invalid Payment
            abort(400, "Bad Request: Insufficient cash received to complete transaction.");
        }

        try {
            DB::beginTransaction();

            $store_order = Order::create([
                'user_id' => $user->id,
                'quantity' => 0, 
                'total' => $fields['total'],
                'discount_percentage' => $fields['discount_percentage'] ?? null,
                'discount_amount' => $fields['discount_amount'] ?? 0,
                'cash_recieved' => $fields['cash_received'],
                'change' => $fields['cash_received'] - $fields['total'],
            ]);
            
            $quantity = 0;

            foreach($fields['cart_id'] as $cart_id){
                // 404 mapped gap: FindOrFail on standard IDs
                $cart = Cart::findOrFail($cart_id);
                $quantity += $cart->quantity; 

                // 404 mapped gap: Ensure the product actually exists inside the transaction loop
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
                return redirect()->route('customer.invoice',['order_id' => $store_order->id]);
            }else{
                throw new \Exception("Failed to update final order quantity.");
            }
        } catch (\Exception $e) {
            // 500 mapped gap: Server/Transaction Error overrides default silent rollback logic
            DB::rollBack();
            abort(500, "Internal Server Error - Transaction failed: " . $e->getMessage());
        }
    }

    public function invoice($order_id){
        // 404 mapped gap
        $order = Order::findOrFail($order_id);
        $orderDetails = OrderDetail::with(['product','user'])->where('order_id',$order_id)->get();

        return inertia('InvoiceReceipt',[
            'order' => $order,
            'orderDetails' => $orderDetails,
        ]);
    }

    public function downloadInvoice($order_id){
        // 404 mapped gap
        $order = Order::findOrFail($order_id);
        $orderDetails = OrderDetail::with(['product','user'])->where('order_id',$order_id)->get();

        return inertia('Admin/InvoiceReceipt',[
            'order' => $order,
            'orderDetails' => $orderDetails,
        ]);
    }

    public function removeItem($cart_id){
        $user = auth()->user();
        $deleteItem = Cart::where('user_id',$user->id)->where('id',$cart_id)->delete();

        if($deleteItem){
            return redirect()->back()->with('success', 'Item voided from cart.');
        }else{
            // 400 mapped gap: Deleting a non-existent item or unowned item
            abort(400, "Bad Request: Failed to remove item from cart.");
        }
    }
}