<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function showInventoryProduct(){
        $products = Product::with(['types', 'batches.employee'])->latest()->paginate(6);
        return inertia('Admin/Inventory', ['products' => $products]);
    }

    public function displayProduct(){
        $products = Product::with(['types', 'batches'])->latest()->paginate(8);
        return inertia('Customer/Product', ['products' => $products]);
    }

    public function showProduct($product_id){
        $product = Product::with(['types', 'batches'])->findOrFail($product_id);
        return inertia('Customer/Product_Features/ShowProduct', ['product' => $product]);
    }

    // INJECTED: Missing method added to support the admin.inventory.viewProduct route
    public function viewProduct($product_id){
        $product = Product::with(['types', 'batches'])->findOrFail($product_id);
        return inertia('Admin/Inventory_Features/ViewProduct', [
            'products' => $product
        ]);
    }

    public function storeProduct(Request $request){
        $fields = $request->validate([
            'product_name' => 'required',
            'description' => 'required',
            'price' => 'required|integer',
            'image' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'types' => 'nullable|array',
            'types.*.name' => 'required|string',
            'types.*.multiplier' => 'required|integer|min:1',
        ]);

        $imagePath = null;
        if($request->hasFile('image')){
            $uploadedImage = cloudinary()->uploadApi()->upload($request->file('image')->getRealPath(), ['folder' => 'products']);
            $imagePath = $uploadedImage['secure_url'];
        }

        $product = Product::create([
            'product_name' => $fields['product_name'],
            'description' => $fields['description'],
            'price' => $fields['price'],
            'image' => $imagePath
        ]);

        if (!empty($fields['types'])) {
            foreach ($fields['types'] as $type) {
                $product->types()->create([
                    'name' => $type['name'],
                    'multiplier' => $type['multiplier']
                ]);
            }
        }

        return redirect()->back()->with('success', 'Flower added successfully to inventory.');
    }

    public function updateProduct(Request $request){
        $fields = $request->validate([
            'id' => 'required|integer',
            'product_name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'types' => 'nullable|array',
            'types.*.name' => 'required|string',
            'types.*.multiplier' => 'required|integer|min:1',
        ]);

        $product = Product::find($request->id);

        if($product){
            $updateData = [
                'product_name' => $fields['product_name'],
                'description' => $fields['description'],
                'price' => $fields['price'],
            ];

            if($request->hasFile('image')){
                $uploadedImage = cloudinary()->uploadApi()->upload($request->file('image')->getRealPath(), ['folder' => 'products']);
                $updateData['image'] = $uploadedImage['secure_url'];
            }

            $product->update($updateData);

            if (!empty($fields['types'])) {
                $incomingTypeNames = collect($fields['types'])->pluck('name')->toArray();
                $product->types()->whereNotIn('name', $incomingTypeNames)->delete();

                foreach ($fields['types'] as $type) {
                    $product->types()->updateOrCreate(
                        ['name' => $type['name']], 
                        ['multiplier' => $type['multiplier']] 
                    );
                }
            } else {
                $product->types()->delete();
            }

            return redirect()->back()->with('success', $fields['product_name'] . ' updated successfully.');
        }else{
            return redirect()->back()->with('error','Updating flower information failed.');
        }
    }

    public function destroyProduct(Product $product){
        if ($product->image) {
            if (str_starts_with($product->image, 'http')) {
                $publicId = pathinfo(parse_url($product->image, PHP_URL_PATH), PATHINFO_FILENAME);
                cloudinary()->uploadApi()->destroy('products/' . $publicId);
            } else {
                Storage::disk('public')->delete($product->image);
            }
        }
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }

    public function storeBatch(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        ProductBatch::create([
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'expires_at' => $request->expires_at,
            'employee_id' => Auth::id(), 
            'status' => 'active',
            'received_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Stock batch added successfully.');
    }

    public function destroyBatch($id)
    {
        $batch = ProductBatch::findOrFail($id);
        
        $batch->update([
            'status' => 'manually_removed'
        ]);

        return redirect()->back()->with('success', 'Batch manually stocked out.');
    }
}
