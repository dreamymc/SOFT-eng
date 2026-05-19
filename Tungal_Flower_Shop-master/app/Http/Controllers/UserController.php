<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderDetail;
use App\Models\Attendance;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function authentication(Request $request) 
    {
        $credentials = $request->validate([
            'username' => 'required',
            'password' => 'required|string',
        ]);

        if(Auth::attempt($credentials)){
            $request->session()->regenerate();

            $user = Auth::user(); 

            if(in_array($user->role, ['Admin', 'Manager', 'Owner'])){
                return redirect()->intended('/admin/dashboard');
            }elseif($user->role === 'Cashier'){
                return redirect()->intended('/product');
            }elseif(strtolower($user->role) === 'delivery'){
                return redirect()->intended('/delivery/dashboard');
            }
            
            return redirect()->intended('/');
            
        }else{
            return redirect()->back()->with('error', 'Incorrect Username or Password!');
        }
    }

    public function dashboard(){
        $allProducts = Product::select('products.*')
            ->with(['batches' => function($query) {
                $query->where('status', 'active')
                      ->orderByRaw('expires_at IS NULL, expires_at ASC');
            }])
            ->addSelect(['total_pieces_sold' => OrderDetail::select(DB::raw('SUM(quantity * COALESCE(multiplier, 1))'))
                ->whereColumn('product_id', 'products.id')
                ->whereHas('order', function ($query) {
                    $query->where('order_status', '!=', 'Refunded');
                })
            ])
            ->get();
        
        $total_flowers_in_store = $allProducts->sum('stocks');
        $recent_orders_count = Order::where('created_at', '>=', now()->subDays(30))->count();

        $chartData = OrderDetail::with('product')
            ->whereHas('order', function ($query) {
                $query->where('order_status', '!=', 'Refunded');
            })
            ->selectRaw('product_id, SUM(total) as total_sales')
            ->groupBy('product_id')
            ->orderByDesc('total_sales')
            ->take(7)
            ->get();

        $topSellingProducts = OrderDetail::with('product')
            ->whereHas('order', function ($query) {
                $query->where('order_status', '!=', 'Refunded');
            })
            ->selectRaw('product_id, SUM(total) as total_sales')
            ->groupBy('product_id')
            ->orderByDesc('total_sales')
            ->take(3)
            ->get();

        $topSellingIds = $topSellingProducts->pluck('product_id')->toArray();

        $leastSellingProducts = OrderDetail::with('product')
            ->whereHas('order', function ($query) {
                $query->where('order_status', '!=', 'Refunded');
            })
            ->selectRaw('product_id, SUM(total) as total_sales')
            ->whereNotIn('product_id', $topSellingIds)
            ->groupBy('product_id')
            ->orderBy('total_sales', 'asc') 
            ->take(3)
            ->get();

        $low_stock_count = $allProducts->where('stocks', '<=', 10)->count(); 
        $total_categories = Product::count(); 
        $recently_added = Product::where('created_at', '>=', now()->subDays(7))->count();
        
        $returned_flowers = \App\Models\ReturnRequest::count();
        $total_pieces_sold = OrderDetail::whereHas('order', function ($query) {
                $query->where('order_status', '!=', 'Refunded');
            })
            ->select(DB::raw('SUM(quantity * COALESCE(multiplier, 1)) as total_pieces'))
            ->value('total_pieces') ?? 0;
        $out_of_stock_count = $allProducts->where('stocks', '<=', 0)->count();
        $active_batch_count = $allProducts->flatMap->batches->count();
        $expiring_soon_count = $allProducts->flatMap->batches
            ->filter(function ($batch) {
                return $batch->expires_at && \Carbon\Carbon::parse($batch->expires_at)->between(now(), now()->addDays(7));
            })
            ->count();

        $lowStockProducts = $allProducts->where('stocks', '<=', 15)->sortBy('stocks')->values();

        $stockAlerts = $lowStockProducts->map(function($product) {
            $type = 'attention';
            $label = 'Attention !';

            if ($product->stocks == 0) {
                $type = 'out_of_stock';
                $label = 'Out of Stock';
            } elseif ($product->stocks <= 5) {
                $type = 'below_minimum';
                $label = 'Below Minimum';
            } elseif ($product->stocks <= 10) {
                $type = 'low_stock';
                $label = 'Low Stock';
            }

            $nextBatch = $product->batches->first();
            $dateText = 'N/A';
            
            if ($product->stocks == 0) {
                $dateText = 'Depleted';
            } elseif ($nextBatch && $nextBatch->expires_at) {
                $dateText = 'Exp: ' . \Carbon\Carbon::parse($nextBatch->expires_at)->format('M j, Y');
            } elseif ($nextBatch && !$nextBatch->expires_at) {
                $dateText = 'Non-Perishable';
            }

            return [
                'id' => $product->id,
                'type' => $type,
                'label' => $label,
                'product' => $product->product_name,
                'units' => $product->stocks,
                'date' => $dateText
            ];
        });

        $salesReportOrders = Order::with(['details.product', 'user', 'deliveredBy'])
            ->where('order_status', '!=', 'Refunded')
            ->latest()
            ->get();

        return inertia('Admin/Dashboard',[
            'total_flowers_in_store' => $total_flowers_in_store,
            'recent_orders_count' => $recent_orders_count,
            'chartData' => $chartData,
            'topSellingProducts' => $topSellingProducts,
            'leastSellingProducts' => $leastSellingProducts,
            'low_stock_count' => $low_stock_count,
            'total_categories' => $total_categories,
            'recently_added' => $recently_added,
            'returned_flowers' => $returned_flowers,
            'total_pieces_sold' => $total_pieces_sold,
            'out_of_stock_count' => $out_of_stock_count,
            'active_batch_count' => $active_batch_count,
            'expiring_soon_count' => $expiring_soon_count,
            'allProducts' => $allProducts,
            'stockAlerts' => $stockAlerts,
            'salesReportOrders' => $salesReportOrders,
        ]);
    }

    public function report(){
        $allProducts = Product::select('products.*')
            ->with(['batches' => function($query) {
                $query->where('status', 'active')
                      ->orderByRaw('expires_at IS NULL, expires_at ASC');
            }])
            ->addSelect(['total_pieces_sold' => OrderDetail::select(DB::raw('SUM(quantity * COALESCE(multiplier, 1))'))
                ->whereColumn('product_id', 'products.id')
                ->whereHas('order', function ($query) {
                    $query->where('order_status', '!=', 'Refunded');
                })
            ])
            ->get();

        $lowStockProducts = $allProducts->where('stocks', '<=', 15)->sortBy('stocks')->values();

        $stockAlerts = $lowStockProducts->map(function($product) {
            $type = 'attention';
            $label = 'Attention !';

            if ($product->stocks == 0) {
                $type = 'out_of_stock';
                $label = 'Out of Stock';
            } elseif ($product->stocks <= 5) {
                $type = 'below_minimum';
                $label = 'Below Minimum';
            } elseif ($product->stocks <= 10) {
                $type = 'low_stock';
                $label = 'Low Stock';
            }

            $nextBatch = $product->batches->first();
            $dateText = 'N/A';
            
            if ($product->stocks == 0) {
                $dateText = 'Depleted';
            } elseif ($nextBatch && $nextBatch->expires_at) {
                $dateText = 'Exp: ' . \Carbon\Carbon::parse($nextBatch->expires_at)->format('M j, Y');
            } elseif ($nextBatch && !$nextBatch->expires_at) {
                $dateText = 'Non-Perishable';
            }

            return [
                'id' => $product->id,
                'type' => $type,
                'label' => $label,
                'product' => $product->product_name,
                'units' => $product->stocks,
                'date' => $dateText
            ];
        });

        $totalSales = Order::where('order_status', '!=', 'Refunded')->sum('total');
        $totalOrders = Order::where('order_status', '!=', 'Refunded')->count();
        $avgSales = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        $current30Start = now()->subDays(30);
        $prev30Start = now()->subDays(60);

        $currentSales = Order::where('order_status', '!=', 'Refunded')->where('created_at', '>=', $current30Start)->sum('total');
        $prevSales = Order::where('order_status', '!=', 'Refunded')->whereBetween('created_at', [$prev30Start, $current30Start])->sum('total');
        $salesTrend = $prevSales > 0 ? round((($currentSales - $prevSales) / $prevSales) * 100) : 0;

        $currentOrdersCount = Order::where('order_status', '!=', 'Refunded')->where('created_at', '>=', $current30Start)->count();
        $prevOrdersCount = Order::where('order_status', '!=', 'Refunded')->whereBetween('created_at', [$prev30Start, $current30Start])->count();
        $ordersTrend = $prevOrdersCount > 0 ? round((($currentOrdersCount - $prevOrdersCount) / $prevOrdersCount) * 100) : 0;

        $currentAvg = $currentOrdersCount > 0 ? $currentSales / $currentOrdersCount : 0;
        $prevAvg = $prevOrdersCount > 0 ? $prevSales / $prevOrdersCount : 0;
        $avgTrend = $prevAvg > 0 ? round((($currentAvg - $prevAvg) / $prevAvg) * 100) : 0;

        $salesOverview = [
            'totalSales' => number_format($totalSales, 0, '.', ' '),
            'salesTrend' => ($salesTrend >= 0 ? '+' : '') . $salesTrend . '% vs last 30 days',
            'totalOrders' => number_format($totalOrders, 0, '.', ' '),
            'ordersTrend' => ($ordersTrend >= 0 ? '+' : '') . $ordersTrend . '% vs last 30 days',
            'avgSales' => number_format($avgSales, 0, '.', ' '),
            'avgTrend' => ($avgTrend >= 0 ? '+' : '') . $avgTrend . '% vs last 30 days',
        ];

        return inertia('Admin/Report', [
            'allProducts' => $allProducts,
            'stockAlerts' => $stockAlerts,
            'salesOverview' => $salesOverview
        ]);
    }
    
    public function storeEmployeeData(Request $request){
        $fields = $request->validate([
            'firstname' => 'required|max:50',
            'lastname' => 'required|max:50',
            'contact_number' => 'required|min:11|max:11|unique:users,contact_number',
            // INJECTED: Allowlist to block rogue Admin escalation
            'role' => ['required', Rule::in(['Admin', 'Owner', 'Manager', 'Cashier', 'Delivery'])],
            'username' => 'required|unique:users,username',
            'password' => 'required|string|min:8',
            'profile' => 'required|file|mimes:jpg,jpeg,png|max:5120'
        ]);

        $fields['password'] = Hash::make($fields['password']);

        if($request->hasFile('profile')){
            $uploadedProfile = cloudinary()->uploadApi()->upload($request->file('profile')->getRealPath(), ['folder' => 'profiles']);
            $fields['profile'] = $uploadedProfile['secure_url'];
            $user = User::create($fields);

            if($user){
                return redirect()->back()->with('success', 'Employee added successfully!');
            }else{
                return redirect()->back()->with('error','Failed to store the data.');
            }
        }
    }

    public function displayEmployee(){
        $employees = User::whereIn('role', ['Admin', 'Owner', 'Manager', 'Cashier', 'Delivery'])->get();
        return inertia('Admin/Employee',['employees' => $employees]);
    }

    public function viewEmployeeProfile($user_id) {
        $employee_profile = User::with('attendances')->find($user_id);
        return inertia('Admin/Employee_Features/ViewProfile', [
            'user_info' => $employee_profile
        ]);
    }

    public function fireEmployee($id) {
        $employee = User::findOrFail($id);
        $currentUser = auth()->user();
        
        if ($employee->id === $currentUser->id) {
            return redirect()->back()->with('error', 'You cannot fire yourself.');
        }

        // INJECTED: Privilege guard against lateral or upward termination
        if (in_array($employee->role, ['Admin', 'Owner']) && !in_array($currentUser->role, ['Admin', 'Owner'])) {
             return redirect()->back()->with('error', 'Unauthorized to terminate this privileged account.');
        }
        
        $employee->delete();
        
        return redirect()->route('admin.employee')->with('success', 'Employee fired successfully.');
    }

    public function storeAttendance(Request $request) {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|string',
            'clock_in' => 'nullable',
            'clock_out' => 'nullable',
        ]);

        Attendance::updateOrCreate(
            ['user_id' => $request->user_id, 'date' => $request->date],
            [
                'status' => $request->status,
                'clock_in' => $request->clock_in,
                'clock_out' => $request->clock_out
            ]
        );

        return redirect()->back()->with('success', "Attendance updated successfully.");
    }

    public function updateUserInfo(Request $request){
        $targetUser = User::findOrFail($request->id);
        $currentUser = auth()->user();

        // INJECTED: Privilege guard against lateral or upward account tampering
        if (in_array($targetUser->role, ['Admin', 'Owner']) && !in_array($currentUser->role, ['Admin', 'Owner'])) {
             return redirect()->back()->with('error', 'Unauthorized to modify this privileged account.');
        }

        $existingContacts = User::where('contact_number',$request->contact_number)->first();

        if($existingContacts && $existingContacts->id == $request->id){
            $field = $request->validate([
                'firstname' => 'required',
                'lastname' => 'required',
                'contact_number' => 'required|min:11|max:11',
                'username' => 'required',
            ]);
        }else{
            $field = $request->validate([
                'firstname' => 'required',
                'lastname' => 'required',
                'contact_number' => 'required|min:11|max:11|unique:users,contact_number',
                'username' => 'required',
            ]);
        }

        if($field){
            $data = User::where('id',$request->id)->update([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'contact_number' => $request->contact_number,
                'username' => $request->username,
            ]);

            if($data){
                return redirect()->route('employee.viewProfile', ['user_id' => $request->id])
                ->with('success', $field['firstname'] . ' information updated successfully.');
            }else{
                return redirect()->back()->with('error','User info failed to update.');
            }
        }
    }

    public function updatePassword(Request $request){
        $targetUser = User::findOrFail($request->id);
        $currentUser = auth()->user();

        // INJECTED: Privilege guard 
        if (in_array($targetUser->role, ['Admin', 'Owner']) && !in_array($currentUser->role, ['Admin', 'Owner'])) {
             return redirect()->back()->with('error', 'Unauthorized to modify this privileged account.');
        }

        $fields = $request->validate([
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        $fields['new_password'] = Hash::make($fields['new_password']);
        $user = User::where('id',$request->id)->update(['password' =>  $fields['new_password']]);

        if($user){
            return redirect()->route('employee.viewProfile',['user_id' => $request->id])
            ->with('success','Password updated successfully.');
        }else{
            return redirect()->back()->with('error','Updating password failed.');
        }
    }

    public function adminProfile(){
        $user = auth()->user(); 
        if($user){
            return inertia('Admin/Profile',['admin' => $user]);
        }
    }

    public function updateAdminInfo(Request $request){
        $field = $request->validate([
            'firstname' => 'required',
            'lastname' => 'required',
            'contact_number' => 'required|min:11|max:11',
            'username' => 'required',
        ]);

        $data = User::where('id', auth()->id())->update([
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'contact_number' => $request->contact_number,
            'username' => $request->username,
        ]);

        if($data){
            return redirect()->route('admin.profile')
            ->with('success', 'Profile updated successfully.');
        }else{
            return redirect()->back()->with('error','Admin info failed to update.');
        }
    }

    public function updateAdminPassword(Request $request){
        $fields = $request->validate([
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        $user = User::where('id', auth()->id())->update(['password' =>  Hash::make($fields['new_password'])]);

        if($user){
            return redirect()->route('admin.profile')
            ->with('success','Password updated successfully.');
        }else{
            return redirect()->back()->with('error','Updating password failed.');
        }
    }

    public function sales(){
        $employees = User::whereIn('role', ['Admin', 'Owner', 'Manager', 'Cashier', 'Delivery'])->get();
        
        $orders = Order::with(['details.product', 'user', 'deliveredBy'])->latest()->paginate(12);

        return inertia('Admin/Sales',[
            'employees' => $employees,
            'orders' => $orders,
            'currentSelected_ID' => 'All'
        ]);
    }

    public function selectedEmployee($user_id){
        $employees = User::whereIn('role', ['Admin', 'Owner', 'Manager', 'Cashier', 'Delivery'])->get();

        if($user_id != 'All'){
            $orders = Order::with(['details.product', 'user', 'deliveredBy'])->where('user_id', $user_id)->latest()->paginate(12);
            return inertia('Admin/Sales',[
                'employees' => $employees,
                'orders' => $orders,
                'currentSelected_ID' => $user_id
            ]);
        }else{
            return redirect()->route('admin.sales');
        }
    }

    public function searchedOrderID(Request $request){
        $rawId = $request->input('order_id');
        $cleanId = preg_replace('/\D+/', '', $rawId);
        
        $employees = User::whereIn('role', ['Admin', 'Owner', 'Manager', 'Cashier', 'Delivery'])->get();
        $orders = Order::with(['details.product', 'user', 'deliveredBy'])->where('id', $cleanId)->latest()->paginate(12);

        return inertia('Admin/Sales',[
            'employees' => $employees,
            'orders' => $orders,
            'currentSelected_ID' => 'All'
        ]);
    }

    public function employeeLogout(Request $request){
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('customer.index');
    }

    public function customer_profile(){
        $user = Auth::user();
        return inertia('Customer/Profile', [
            'user_info' => $user
        ]);
    }

    public function updateProfileInfo(Request $request){
        $user = Auth::user();
        $request->validate([
            'firstname' => 'required',
            'lastname' => 'required',
            'contact_number' => 'required|min:11|max:11',
            'username' => 'required',
        ]);

        $user->update([
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'contact_number' => $request->contact_number,
            'username' => $request->username,
        ]);

        return redirect()->route('customer.profile')->with('success', 'Information updated successfully.');
    }

    public function updateProfilePassword(Request $request){
        $request->validate([
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->new_password),
        ]);

        return redirect()->route('customer.profile')->with('success', 'Password updated successfully.');
    }

    public function payroll(){
        $employees = User::whereIn('role', ['Admin', 'Owner', 'Manager', 'Cashier', 'Delivery'])->get();
        
        $payrolls = Payroll::with(['employee', 'processedBy'])->latest()->paginate(10);

        return inertia('Admin/Payroll', [
            'employees' => $employees,
            'payrolls' => $payrolls
        ]);
    }

    public function storePayroll(Request $request){
        $fields = $request->validate([
            'employee_id' => 'required|exists:users,id',
            'payroll_date' => 'required|date',
            'salary_method' => 'required|string',
            'rate' => 'required|numeric|min:0',
            'days_worked' => 'required|numeric|min:0',
            'regular_ot' => 'required|numeric|min:0',
            'total_ot_pay' => 'required|numeric|min:0',
            'ecola' => 'required|numeric|min:0',
            'allowance' => 'required|numeric|min:0',
            'other_pay' => 'required|numeric|min:0',
            'gross_pay' => 'required|numeric|min:0',
        ]);

        $fields['status'] = 'Pending';

        $payroll = Payroll::create($fields);

        if($payroll){
            return redirect()->back()->with('success', 'Payroll record successfully generated.');
        } else {
            return redirect()->back()->with('error', 'Failed to generate payroll record.');
        }
    }

    public function updatePayroll(Request $request, $id){
        $fields = $request->validate([
            'employee_id' => 'required|exists:users,id',
            'payroll_date' => 'required|date',
            'salary_method' => 'required|string',
            'rate' => 'required|numeric|min:0',
            'days_worked' => 'required|numeric|min:0',
            'regular_ot' => 'required|numeric|min:0',
            'total_ot_pay' => 'required|numeric|min:0',
            'ecola' => 'required|numeric|min:0',
            'allowance' => 'required|numeric|min:0',
            'other_pay' => 'required|numeric|min:0',
            'gross_pay' => 'required|numeric|min:0',
        ]);

        $payroll = Payroll::findOrFail($id);
        $payroll->update($fields);

        return redirect()->back()->with('success', 'Payroll record successfully updated.');
    }
}
