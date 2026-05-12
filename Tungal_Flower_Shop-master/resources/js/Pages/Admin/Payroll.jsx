import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layout/AdminLayout';

// --- CUSTOM ICONS ---
const CreateIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <line x1="12" y1="15" x2="12" y2="21"></line>
        <line x1="9" y1="18" x2="15" y2="18"></line>
    </svg>
);

const ViewIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const ActionIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M12 18v-6"></path>
        <path d="M9 15h6"></path>
    </svg>
);

const ArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 19"></polyline>
    </svg>
);

// Helper for formatting labels
const getFieldLabel = (field) => {
    if (field === 'regular_ot') return 'Overtime Hours';
    if (field === 'total_ot_pay') return 'Total OT Pay';
    if (field === 'days_worked') return 'Days Worked';
    if (field === 'ecola') return 'ECOLA';
    return field.replace(/_/g, ' ');
};

// INJECTED: Centralized Status Badge styling logic
const getStatusBadge = (status) => {
    if (status === 'Approved') return 'bg-success text-white';
    if (status === 'Rejected') return 'bg-danger text-white';
    return 'bg-warning text-dark';
};

// --- CREATE MODAL (Blue Button) ---
const CreatePayrollModal = ({ isOpen, onClose, employees }) => {
    if (!isOpen) return null;

    const { data, setData, post, processing, reset, transform } = useForm({
        payroll_id: 'AUTO',
        employee_id: '',
        payroll_date: '',
        salary_method: 'Cash',
        rate: '', 
        days_worked: '', 
        regular_ot: '', 
        total_ot_pay: '', 
        ecola: '', 
        allowance: '', 
        other_pay: '', 
        gross_pay: ''
    });

    // Ensures all empty fields are cast to 0 on submission to satisfy the Database
    transform((data) => ({
        ...data,
        rate: data.rate || 0,
        days_worked: data.days_worked || 0,
        regular_ot: data.regular_ot || 0,
        total_ot_pay: data.total_ot_pay || 0,
        ecola: data.ecola || 0,
        allowance: data.allowance || 0,
        other_pay: data.other_pay || 0,
        gross_pay: data.gross_pay || 0,
    }));

    // Auto-calculate Gross Pay
    useEffect(() => {
        const basePay = (parseFloat(data.rate) || 0) * (parseFloat(data.days_worked) || 0);
        const ot = parseFloat(data.total_ot_pay) || 0;
        const ecola = parseFloat(data.ecola) || 0;
        const allowance = parseFloat(data.allowance) || 0;
        const other_pay = parseFloat(data.other_pay) || 0;
        
        const gross = basePay + ot + ecola + allowance + other_pay;

        if (parseFloat(data.gross_pay || 0) !== gross) {
            setData('gross_pay', gross > 0 ? gross.toFixed(2) : '');
        }
    }, [data.rate, data.days_worked, data.total_ot_pay, data.ecola, data.allowance, data.other_pay]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.storePayroll'), {
            onSuccess: () => { 
                onClose(); 
                reset(); 
            }
        });
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
            <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '24px', width: '100%', maxWidth: '850px', backgroundColor: '#FFF', maxHeight: '95vh', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit} className="card-body p-4">
                    <h2 className="fw-bolder text-center mb-4" style={{ color: '#1E1E1E' }}>Create Payroll</h2>
                    
                    <div className="row g-3 mb-4">
                        <div className="col-md-6 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px' }}>Payroll ID</span>
                            <input type="text" className="form-control text-center shadow-none bg-light" value={data.payroll_id} readOnly style={{ borderRadius: '8px', border: '1px solid #DEE2E6', width: '80px' }} />
                        </div>
                        <div className="col-md-6 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px' }}>Employee</span>
                            <select className="form-select shadow-none flex-grow-1" value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #DEE2E6' }}>
                                <option value="" disabled>Select Employee</option>
                                {employees && employees.length > 0 ? (
                                    employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.id} - {emp.firstname} {emp.lastname}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="1">1 - Admin Main</option>
                                        <option value="2">2 - Manager Main</option>
                                        <option value="3">3 - Cashier Main</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="col-md-6 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px' }}>Payroll Date</span>
                            <input type="date" className="form-control shadow-none flex-grow-1" value={data.payroll_date} onChange={(e) => setData('payroll_date', e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #DEE2E6' }} />
                        </div>
                        <div className="col-md-6 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px', whiteSpace: 'nowrap' }}>Salary Method</span>
                            <select className="form-select shadow-none flex-grow-1" value={data.salary_method} onChange={(e) => setData('salary_method', e.target.value)} style={{ borderRadius: '8px', border: '1px solid #DEE2E6' }}>
                                <option value="Cash">Cash</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                    </div>

                    <div className="row g-4 mb-2">
                        {/* Left Column - Regular Pay & OT */}
                        <div className="col-md-6">
                            <div className="text-center py-2 mb-3 rounded-top" style={{ backgroundColor: '#D8D8DF' }}>
                                <h6 className="fw-bold m-0 text-muted" style={{ color: '#5A637A' }}>Regular and Overtime Pay</h6>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {['rate', 'days_worked', 'regular_ot', 'total_ot_pay'].map((field) => (
                                    <div className="d-flex align-items-center" key={field}>
                                        <span className="fw-medium text-dark text-capitalize" style={{ width: '100px', fontSize: '14px' }}>
                                            {getFieldLabel(field)}
                                        </span>
                                        {['days_worked', 'regular_ot'].includes(field) ? (
                                            <input type="number" className="form-control shadow-none" value={data[field]} onChange={(e) => setData(field, e.target.value)} style={{ borderRadius: '8px' }} />
                                        ) : (
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px' }}>₱</span>
                                                <input type="number" className={`form-control shadow-none border-start-0 ${field === 'total_ot_pay' ? 'fw-bold' : ''}`} value={data[field]} onChange={(e) => setData(field, e.target.value)} style={{ borderRadius: '0 8px 8px 0' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex justify-content-center gap-3 mt-4">
                                <button type="button" onClick={onClose} className="btn fw-bold text-white shadow-none" style={{ backgroundColor: '#D9534F', borderRadius: '8px', width: '120px', height: '42px' }}>Cancel</button>
                                <button type="submit" disabled={processing} className="btn fw-bold text-white shadow-sm border-0" style={{ backgroundColor: '#758AF8', borderRadius: '8px', width: '120px', height: '42px' }}>
                                    {processing ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Allowances & Gross Total */}
                        <div className="col-md-6 border-start border-2 ps-md-4">
                            <div className="text-center py-2 mb-3 rounded-top" style={{ backgroundColor: '#D8D8DF' }}>
                                <h6 className="fw-bold m-0 text-muted" style={{ color: '#5A637A' }}>Additional Pay & Total</h6>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {['ecola', 'allowance', 'other_pay'].map((field) => (
                                    <div className="d-flex align-items-center" key={field}>
                                        <span className="fw-medium text-dark text-capitalize" style={{ width: '100px', fontSize: '14px' }}>
                                            {getFieldLabel(field)}
                                        </span>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px' }}>₱</span>
                                            <input type="number" className="form-control shadow-none border-start-0" value={data[field]} onChange={(e) => setData(field, e.target.value)} style={{ borderRadius: '0 8px 8px 0' }} />
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="d-flex align-items-center pt-3 border-top border-2 mt-4">
                                    <span className="fw-bolder text-dark" style={{ width: '100px', fontSize: '16px' }}>Gross Pay</span>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px' }}>₱</span>
                                        <input type="number" className="form-control shadow-none border-start-0 fw-bolder text-dark bg-light" value={data.gross_pay} readOnly style={{ borderRadius: '0 8px 8px 0', fontSize: '16px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- UPDATE MODAL (Orange Button) ---
const UpdatePayrollModal = ({ isOpen, onClose, payrollRecord, employees }) => {
    if (!isOpen || !payrollRecord) return null;

    const isApproved = payrollRecord.status === 'Approved';

    const { data, setData, put, processing, reset, transform } = useForm({
        employee_id: payrollRecord.employee_id || payrollRecord.user_id || '',
        payroll_date: payrollRecord.payroll_date || '',
        salary_method: payrollRecord.salary_method || 'Cash',
        rate: payrollRecord.rate || '', 
        days_worked: payrollRecord.days_worked || '', 
        regular_ot: payrollRecord.regular_ot || '', 
        total_ot_pay: payrollRecord.total_ot_pay || '',
        ecola: payrollRecord.ecola || '', 
        allowance: payrollRecord.allowance || '', 
        other_pay: payrollRecord.other_pay || '', 
        gross_pay: payrollRecord.gross_pay || ''
    });

    // Populate data when modal opens with a new record
    useEffect(() => {
        if (payrollRecord) {
            setData({
                employee_id: payrollRecord.employee_id || payrollRecord.user_id || '',
                payroll_date: payrollRecord.payroll_date || '',
                salary_method: payrollRecord.salary_method || 'Cash',
                rate: payrollRecord.rate || '', 
                days_worked: payrollRecord.days_worked || '', 
                regular_ot: payrollRecord.regular_ot || '', 
                total_ot_pay: payrollRecord.total_ot_pay || '',
                ecola: payrollRecord.ecola || '', 
                allowance: payrollRecord.allowance || '', 
                other_pay: payrollRecord.other_pay || '', 
                gross_pay: payrollRecord.gross_pay || ''
            });
        }
    }, [payrollRecord]);

    // Format empty fields to zero
    transform((data) => ({
        ...data,
        rate: data.rate || 0,
        days_worked: data.days_worked || 0,
        regular_ot: data.regular_ot || 0,
        total_ot_pay: data.total_ot_pay || 0,
        ecola: data.ecola || 0,
        allowance: data.allowance || 0,
        other_pay: data.other_pay || 0,
        gross_pay: data.gross_pay || 0,
    }));

    // Auto-calculate
    useEffect(() => {
        if (isApproved) return;
        const basePay = (parseFloat(data.rate) || 0) * (parseFloat(data.days_worked) || 0);
        const ot = parseFloat(data.total_ot_pay) || 0;
        const ecola = parseFloat(data.ecola) || 0;
        const allowance = parseFloat(data.allowance) || 0;
        const other_pay = parseFloat(data.other_pay) || 0;
        
        const gross = basePay + ot + ecola + allowance + other_pay;

        if (parseFloat(data.gross_pay || 0) !== gross) {
            setData('gross_pay', gross > 0 ? gross.toFixed(2) : '');
        }
    }, [data.rate, data.days_worked, data.total_ot_pay, data.ecola, data.allowance, data.other_pay, isApproved]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.updatePayroll', payrollRecord.id), {
            onSuccess: () => { onClose(); reset(); }
        });
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
            <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '24px', width: '100%', maxWidth: '850px', backgroundColor: '#FFF', maxHeight: '95vh', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit} className="card-body p-4">
                    
                    <h2 className="fw-bolder text-center mb-4" style={{ color: '#1E1E1E' }}>
                        Update Payroll
                        <span className={`badge ms-3 align-middle ${getStatusBadge(payrollRecord.status)}`} style={{ fontSize: '14px', verticalAlign: 'middle' }}>
                            {payrollRecord.status}
                        </span>
                    </h2>

                    {/* INJECTED: Display Rejection Reason if Rejected */}
                    {payrollRecord.status === 'Rejected' && payrollRecord.rejection_reason && (
                        <div className="mb-4 text-center">
                            <div className="d-inline-block px-4 py-2 rounded bg-light border border-danger text-dark fw-medium">
                                <span className="text-danger fw-bold d-block mb-1" style={{ fontSize: '13px' }}>Rejection Reason</span>
                                {payrollRecord.rejection_reason}
                            </div>
                        </div>
                    )}
                    
                    <div className="row g-3 mb-4">
                        <div className="col-md-4 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px' }}>Payroll ID</span>
                            <input type="text" className="form-control text-center shadow-none bg-light" value={`#${String(payrollRecord.id).padStart(4, '0')}`} readOnly style={{ borderRadius: '8px', border: '1px solid #DEE2E6', width: '90px' }} />
                        </div>
                        <div className="col-md-4 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px' }}>Employee</span>
                            <select className={`form-select shadow-none flex-grow-1 ${isApproved ? 'bg-light' : ''}`} value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} disabled={isApproved} style={{ borderRadius: '8px', border: '1px solid #DEE2E6' }}>
                                <option value="" disabled>Select Employee</option>
                                {employees && employees.length > 0 ? (
                                    employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.id} - {emp.firstname} {emp.lastname}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="1">1 - Admin Main</option>
                                        <option value="2">2 - Manager Main</option>
                                        <option value="3">3 - Cashier Main</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="col-md-4 d-flex align-items-center gap-3">
                            <span className="fw-medium text-dark" style={{ fontSize: '14px', minWidth: '90px' }}>Salary Method</span>
                            <select className={`form-select shadow-none flex-grow-1 ${isApproved ? 'bg-light' : ''}`} value={data.salary_method} onChange={(e) => setData('salary_method', e.target.value)} disabled={isApproved} style={{ borderRadius: '8px', border: '1px solid #DEE2E6' }}>
                                <option value="Cash">Cash</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                    </div>

                    <div className="row g-4 mb-2">
                        {/* Left Column */}
                        <div className="col-md-6">
                            <div className="text-center py-2 mb-3 rounded-top" style={{ backgroundColor: '#D8D8DF' }}>
                                <h6 className="fw-bold m-0 text-muted" style={{ color: '#5A637A' }}>Regular and Overtime Pay</h6>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {['rate', 'days_worked', 'regular_ot', 'total_ot_pay'].map((field) => (
                                    <div className="d-flex align-items-center" key={field}>
                                        <span className="fw-medium text-dark text-capitalize" style={{ width: '100px', fontSize: '14px' }}>
                                            {getFieldLabel(field)}
                                        </span>
                                        {['days_worked', 'regular_ot'].includes(field) ? (
                                            <input type="number" className={`form-control shadow-none ${isApproved ? 'bg-light' : ''}`} value={data[field]} onChange={(e) => setData(field, e.target.value)} readOnly={isApproved} style={{ borderRadius: '8px' }} />
                                        ) : (
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px' }}>₱</span>
                                                <input type="number" className={`form-control shadow-none border-start-0 ${field === 'total_ot_pay' ? 'fw-bold' : ''} ${isApproved ? 'bg-light' : ''}`} value={data[field]} onChange={(e) => setData(field, e.target.value)} readOnly={isApproved} style={{ borderRadius: '0 8px 8px 0' }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-center gap-3 mt-4">
                                <button type="button" onClick={onClose} className="btn fw-bold text-white shadow-none" style={{ backgroundColor: '#D9534F', borderRadius: '8px', width: '120px', height: '42px' }}>
                                    Cancel
                                </button>
                                {!isApproved && (
                                    <button type="submit" disabled={processing} className="btn fw-bold text-white shadow-sm border-0" style={{ backgroundColor: '#EAA144', borderRadius: '8px', width: '120px', height: '42px' }}>
                                        {processing ? 'Updating...' : 'Update'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-6 border-start border-2 ps-md-4">
                            <div className="text-center py-2 mb-3 rounded-top" style={{ backgroundColor: '#D8D8DF' }}>
                                <h6 className="fw-bold m-0 text-muted" style={{ color: '#5A637A' }}>Additional Pay & Total</h6>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {['ecola', 'allowance', 'other_pay'].map((field) => (
                                    <div className="d-flex align-items-center" key={field}>
                                        <span className="fw-medium text-dark text-capitalize" style={{ width: '100px', fontSize: '14px' }}>
                                            {getFieldLabel(field)}
                                        </span>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px' }}>₱</span>
                                            <input type="number" className={`form-control shadow-none border-start-0 ${isApproved ? 'bg-light' : ''}`} value={data[field]} onChange={(e) => setData(field, e.target.value)} readOnly={isApproved} style={{ borderRadius: '0 8px 8px 0' }} />
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="d-flex align-items-center pt-3 border-top border-2 mt-4">
                                    <span className="fw-bolder text-dark" style={{ width: '100px', fontSize: '16px' }}>Gross Pay</span>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px' }}>₱</span>
                                        <input type="number" className={`form-control shadow-none border-start-0 fw-bolder text-dark bg-light`} value={data.gross_pay} readOnly style={{ borderRadius: '0 8px 8px 0', fontSize: '16px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- VIEW ONLY MODAL (Clean Design / Form Fields Removed) ---
const ViewPayrollModal = ({ isOpen, onClose, payrollRecord }) => {
    if (!isOpen || !payrollRecord) return null;

    const empName = payrollRecord.employee ? `${payrollRecord.employee.firstname} ${payrollRecord.employee.lastname}` : 'Unknown';

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
            <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '24px', width: '100%', maxWidth: '850px', backgroundColor: '#FFF', maxHeight: '95vh', overflowY: 'auto' }}>
                <div className="card-body p-4 p-md-5">
                    
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h3 className="fw-bolder m-0" style={{ color: '#1E1E1E' }}>Payroll Details</h3>
                        <span className={`badge px-3 py-2 rounded-pill fs-6 ${getStatusBadge(payrollRecord.status)}`}>
                            {payrollRecord.status}
                        </span>
                    </div>

                    {/* INJECTED: Display Rejection Reason if applicable */}
                    {payrollRecord.status === 'Rejected' && payrollRecord.rejection_reason && (
                        <div className="mb-4">
                            <span className="text-danger fw-bold d-block mb-2" style={{ fontSize: '13px' }}>Rejection Reason (Admin)</span>
                            <div className="p-3 rounded bg-light text-dark fw-medium border border-danger" style={{ minHeight: '60px' }}>
                                {payrollRecord.rejection_reason}
                            </div>
                        </div>
                    )}
                    
                    {/* Top Info Grid */}
                    <div className="row g-3 mb-4 p-4 bg-light rounded-3 border">
                        <div className="col-md-3 border-end">
                            <span className="fw-bold text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Payroll ID</span>
                            <span className="fw-bolder text-dark" style={{ fontSize: '15px' }}>#{String(payrollRecord.id).padStart(4, '0')}</span>
                        </div>
                        <div className="col-md-3 border-end ps-md-4">
                            <span className="fw-bold text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Employee ID</span>
                            <span className="fw-bolder text-dark" style={{ fontSize: '15px' }}>{payrollRecord.employee_id}</span>
                        </div>
                        <div className="col-md-6 ps-md-4">
                            <span className="fw-bold text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Employee Name</span>
                            <span className="fw-bolder text-dark text-truncate d-block" style={{ fontSize: '15px' }} title={empName}>
                                {empName}
                            </span>
                        </div>
                        <div className="col-md-6 border-end pt-3 mt-3 border-top">
                            <span className="fw-bold text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Payroll Date</span>
                            <span className="fw-bolder text-dark" style={{ fontSize: '15px' }}>{payrollRecord.payroll_date || '-'}</span>
                        </div>
                        <div className="col-md-6 ps-md-4 pt-3 mt-3 border-top">
                            <span className="fw-bold text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Salary Method</span>
                            <span className="fw-bolder text-dark" style={{ fontSize: '15px' }}>{payrollRecord.salary_method || 'Cash'}</span>
                        </div>
                    </div>

                    <div className="row g-4 mb-2">
                        {/* Left Column */}
                        <div className="col-md-6">
                            <div className="text-center py-2 mb-3 rounded-top" style={{ backgroundColor: '#D8D8DF' }}>
                                <h6 className="fw-bold m-0 text-muted" style={{ color: '#5A637A' }}>Regular and Overtime Pay</h6>
                            </div>
                            <div className="d-flex flex-column gap-3 px-2">
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">Rate</span>
                                    <span className="fw-bold text-dark">₱{payrollRecord.rate}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">Days Worked</span>
                                    <span className="fw-bold text-dark">{Number(payrollRecord.days_worked)}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">Overtime Hours</span>
                                    <span className="fw-bold text-dark">{Number(payrollRecord.regular_ot)} hrs</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">Total OT Pay</span>
                                    <span className="fw-bold text-dark">₱{payrollRecord.total_ot_pay}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-6 border-start border-2 ps-md-4">
                            <div className="text-center py-2 mb-3 rounded-top" style={{ backgroundColor: '#D8D8DF' }}>
                                <h6 className="fw-bold m-0 text-muted" style={{ color: '#5A637A' }}>Additional Pay & Total</h6>
                            </div>
                            <div className="d-flex flex-column gap-3 px-2">
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">ECOLA</span>
                                    <span className="fw-bold text-dark">₱{payrollRecord.ecola}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">Allowance</span>
                                    <span className="fw-bold text-dark">₱{payrollRecord.allowance}</span>
                                </div>
                                <div className="d-flex justify-content-between border-bottom pb-2">
                                    <span className="fw-medium text-muted">Other Pay</span>
                                    <span className="fw-bold text-dark">₱{payrollRecord.other_pay}</span>
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-2 mt-2">
                                    <span className="fw-bolder text-dark" style={{ fontSize: '16px' }}>Gross Pay</span>
                                    <span className="fw-bolder fs-4" style={{ color: '#7859FF' }}>₱{payrollRecord.gross_pay}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-5">
                        <button type="button" onClick={onClose} className="btn fw-bold text-white shadow-none px-5" style={{ backgroundColor: '#6C757D', borderRadius: '8px', height: '45px' }}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Payroll({ payrolls, employees = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    const displayedPayrolls = payrolls?.data || payrolls || [];

    const openViewModal = (payroll) => {
        setSelectedPayroll(payroll);
        setIsViewModalOpen(true);
    };

    const openUpdateModal = (payroll) => {
        setSelectedPayroll(payroll);
        setIsUpdateModalOpen(true);
    };

    return (
        <div className="container-fluid py-5 px-5" style={{ minHeight: '100vh', backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Payroll Management" />

            <div className="d-flex justify-content-between align-items-center mb-5">
                <h1 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '36px', letterSpacing: '-0.5px' }}>Pay</h1>
                
                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                        <input 
                            type="text" 
                            className="form-control shadow-none border-0 text-center fw-medium" 
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ backgroundColor: '#EBE9F1', borderRadius: '50px', width: '300px', height: '48px', color: '#5A637A' }} 
                        />
                    </div>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn d-flex align-items-center justify-content-center gap-2 fw-semibold text-white shadow-sm border-0"
                        style={{ backgroundColor: '#758AF8', borderRadius: '50px', height: '48px', padding: '0 24px', fontSize: '15px' }}
                    >
                        <CreateIcon /> Create Payroll
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0 text-center">
                        <thead style={{ backgroundColor: '#E3E4ED', color: '#1E1E1E' }}>
                            <tr>
                                <th className="py-4 fw-bold" style={{ fontSize: '15px', width: '15%' }}>Payroll ID</th>
                                <th className="py-4 fw-bold" style={{ fontSize: '15px', width: '20%' }}>Employee</th>
                                <th className="py-4 fw-bold" style={{ fontSize: '15px', width: '15%' }}>Salary Method</th>
                                <th className="py-4 fw-bold" style={{ fontSize: '15px', width: '20%' }}>Status</th>
                                <th className="py-4 fw-bold" style={{ fontSize: '15px', width: '15%' }}>Date Received</th>
                                <th className="py-4 fw-bold" style={{ fontSize: '15px', width: '15%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedPayrolls.length > 0 ? (
                                displayedPayrolls.map((row, index) => (
                                    <tr key={index} style={{ borderBottom: index !== displayedPayrolls.length - 1 ? '1px solid #F0F0F5' : 'none' }}>
                                        <td className="py-4 fw-bolder text-dark" style={{ fontSize: '15px' }}>{row.id}</td>
                                        <td className="py-4 text-dark" style={{ fontSize: '15px' }}>
                                            {row.employee ? `${row.employee.firstname} ${row.employee.lastname}` : `Employee ID: ${row.employee_id}`}
                                        </td>
                                        <td className="py-4 text-dark" style={{ fontSize: '15px' }}>{row.salary_method || 'Cash'}</td>
                                        <td className="py-4 text-dark" style={{ fontSize: '15px' }}>
                                            <span className={`badge ${getStatusBadge(row.status)}`}>
                                                {row.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-dark" style={{ fontSize: '15px' }}>{row.payroll_date || '-'}</td>
                                        <td className="py-4">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button 
                                                    onClick={() => openViewModal(row)}
                                                    className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-dark shadow-sm border-0" 
                                                    style={{ backgroundColor: '#E3E4ED', borderRadius: '8px', padding: '6px 12px', fontSize: '13px' }}
                                                >
                                                    <ViewIcon /> View
                                                </button>
                                                
                                                {row.status !== 'Approved' && (
                                                    <button 
                                                        onClick={() => openUpdateModal(row)}
                                                        className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-white shadow-sm border-0" 
                                                        style={{ backgroundColor: '#EAA144', borderRadius: '8px', padding: '6px 12px', fontSize: '13px' }}
                                                    >
                                                        <ActionIcon /> Edit
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">No payroll records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FIXED: Restored the Modal Mounts to the DOM */}
            <CreatePayrollModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} employees={employees} />
            <UpdatePayrollModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} payrollRecord={selectedPayroll} employees={employees} />
            <ViewPayrollModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} payrollRecord={selectedPayroll} />
            
        </div>
    );
}

Payroll.layout = page => <AdminLayout children={page} />;