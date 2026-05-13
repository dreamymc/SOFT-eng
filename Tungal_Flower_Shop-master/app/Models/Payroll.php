<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'payroll_date',
        'salary_method',
        'rate',
        'days_worked',
        'regular_ot',
        'total_ot_pay',
        'ecola',
        'allowance',
        'other_pay',
        'gross_pay',
        'status',
        'rejection_reason'
    ];

    /**
     * Get the employee associated with the payroll record.
     */
    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}