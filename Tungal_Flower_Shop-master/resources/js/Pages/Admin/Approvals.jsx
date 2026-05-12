import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layout/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import ConfirmModal from '../../Components/ConfirmModal';

// --- ICONS ---
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const ActionIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M9 15l2 2 4-4"></path>
    </svg>
);

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// --- MODALS ---

const ReviewPayrollModal = ({ isOpen, onClose, record }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsRejecting(false);
            setRejectionReason('');
            setRejectionError('');
            setIsSubmitting(false);
            setIsApproveConfirmOpen(false);
        }
    }, [isOpen]);

    if (!isOpen || !record) return null;

    const submitAction = (action, payload = {}) => {
        setIsSubmitting(true);
        router.put(route('admin.approvals.payroll', { id: record.id, action }), payload, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setIsSubmitting(false)
        });
    };

    const handleApprove = () => {
        setIsApproveConfirmOpen(false);
        submitAction('approve');
    };

    const handleReject = () => {
        const reason = rejectionReason.trim();

        if (!reason) {
            setRejectionError('A rejection reason is required.');
            return;
        }

        submitAction('reject', { rejection_reason: reason });
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
            <div className="card shadow-lg border-0" style={{ borderRadius: '24px', width: '100%', maxWidth: '500px', backgroundColor: '#FFF' }}>
                <div className="card-body p-4 p-md-5">
                    <h3 className="fw-bolder text-center mb-4" style={{ color: '#1E1E1E' }}>Review Payroll</h3>
                    
                    <div className="d-flex flex-column gap-3 mb-4">
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Employee:</span>
                            <span className="fw-bold text-dark">{record.employee?.firstname} {record.employee?.lastname}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Days Worked:</span>
                            <span className="fw-bold text-dark">{record.days_worked} days</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Rate:</span>
                            <span className="fw-bold text-dark">₱{record.rate}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Overtime Pay:</span>
                            <span className="fw-bold text-dark">₱{record.total_ot_pay}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Gross Pay:</span>
                            <span className="fw-bold text-dark" style={{ color: '#7859FF' }}>₱{record.gross_pay}</span>
                        </div>
                    </div>

                    {isRejecting && (
                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>
                                Rejection Reason
                            </label>
                            <textarea
                                className={`form-control shadow-none ${rejectionError ? 'is-invalid' : ''}`}
                                rows="4"
                                value={rejectionReason}
                                onChange={(e) => {
                                    setRejectionReason(e.target.value);
                                    if (rejectionError) setRejectionError('');
                                }}
                                placeholder="Explain why this payroll is being rejected..."
                                style={{ borderRadius: '8px', resize: 'none' }}
                            />
                            {rejectionError && <div className="invalid-feedback d-block">{rejectionError}</div>}
                        </div>
                    )}

                    {isRejecting ? (
                        <div className="d-flex justify-content-between gap-3 mt-4">
                            <button type="button" onClick={() => setIsRejecting(false)} disabled={isSubmitting} className="btn w-50 fw-bold text-muted" style={{ backgroundColor: '#EBEAEE', borderRadius: '8px', height: '45px' }}>
                                Back
                            </button>
                            <button type="button" onClick={handleReject} disabled={isSubmitting} className="btn w-50 fw-bold text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#DC3545', borderRadius: '8px', height: '45px' }}>
                                <XIcon /> {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-between gap-3 mt-4">
                            <button type="button" onClick={() => setIsRejecting(true)} disabled={isSubmitting} className="btn w-50 fw-bold text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#DC3545', borderRadius: '8px', height: '45px' }}>
                                <XIcon /> Reject
                            </button>
                            <button type="button" onClick={() => setIsApproveConfirmOpen(true)} disabled={isSubmitting} className="btn w-50 fw-bold text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#198754', borderRadius: '8px', height: '45px' }}>
                                <CheckIcon /> Approve
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="btn btn-link text-muted w-100 mt-2 text-decoration-none shadow-none">Cancel</button>
                </div>
            </div>
            <ConfirmModal
                isOpen={isApproveConfirmOpen}
                title="Approve Payroll?"
                message="Are you sure you want to approve this payroll?"
                confirmLabel="Approve"
                variant="success"
                isProcessing={isSubmitting}
                onCancel={() => setIsApproveConfirmOpen(false)}
                onConfirm={handleApprove}
            />
        </div>
    );
};

const ReviewReturnModal = ({ isOpen, onClose, record }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsRejecting(false);
            setRejectionReason('');
            setRejectionError('');
            setIsSubmitting(false);
            setIsApproveConfirmOpen(false);
        }
    }, [isOpen]);

    if (!isOpen || !record) return null;

    const submitAction = (action, payload = {}) => {
        setIsSubmitting(true);
        router.put(route('admin.approvals.return', { id: record.id, action }), payload, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setIsSubmitting(false)
        });
    };

    const handleApprove = () => {
        setIsApproveConfirmOpen(false);
        submitAction('approve');
    };

    const handleReject = () => {
        const reason = rejectionReason.trim();

        if (!reason) {
            setRejectionError('A rejection reason is required.');
            return;
        }

        submitAction('reject', { rejection_reason: reason });
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
            <div className="card shadow-lg border-0" style={{ borderRadius: '24px', width: '100%', maxWidth: '500px', backgroundColor: '#FFF' }}>
                <div className="card-body p-4 p-md-5">
                    <h3 className="fw-bolder text-center mb-4" style={{ color: '#1E1E1E' }}>Review Return Request</h3>
                    
                    <div className="d-flex flex-column gap-3 mb-4">
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Request ID:</span>
                            <span className="fw-bold text-dark">#TUNGAL{record.id}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Order ID:</span>
                            <span className="fw-bold text-dark">#TUNGAL{record.order_id}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Cashier:</span>
                            <span className="fw-bold text-dark">
                                {record.cashier ? `${record.cashier.firstname} ${record.cashier.lastname}` : 'Unknown'}
                            </span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Date & Time:</span>
                            <span className="fw-bold text-dark">
                                {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(record.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Reason:</span>
                            <span className="fw-bold text-dark">{record.reason || 'Not Specified'}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Method:</span>
                            <span className="fw-bold text-dark">{record.refund_method || 'N/A'}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Quantity Returned:</span>
                            <span className="fw-bold text-dark">{record.total_quantity || 0} items</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="fw-medium text-muted">Amount to Refund:</span>
                            <span className="fw-bold text-danger">₱{record.refund_amount || 0}</span>
                        </div>
                    </div>

                    {isRejecting && (
                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>
                                Rejection Reason
                            </label>
                            <textarea
                                className={`form-control shadow-none ${rejectionError ? 'is-invalid' : ''}`}
                                rows="4"
                                value={rejectionReason}
                                onChange={(e) => {
                                    setRejectionReason(e.target.value);
                                    if (rejectionError) setRejectionError('');
                                }}
                                placeholder="Explain why this return request is being rejected..."
                                style={{ borderRadius: '8px', resize: 'none' }}
                            />
                            {rejectionError && <div className="invalid-feedback d-block">{rejectionError}</div>}
                        </div>
                    )}

                    {isRejecting ? (
                        <div className="d-flex justify-content-between gap-3 mt-4">
                            <button type="button" onClick={() => setIsRejecting(false)} disabled={isSubmitting} className="btn w-50 fw-bold text-muted" style={{ backgroundColor: '#EBEAEE', borderRadius: '8px', height: '45px' }}>
                                Back
                            </button>
                            <button type="button" onClick={handleReject} disabled={isSubmitting} className="btn w-50 fw-bold text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#DC3545', borderRadius: '8px', height: '45px' }}>
                                <XIcon /> {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex justify-content-between gap-3 mt-4">
                            <button type="button" onClick={() => setIsRejecting(true)} disabled={isSubmitting} className="btn w-50 fw-bold text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#DC3545', borderRadius: '8px', height: '45px' }}>
                                <XIcon /> Reject
                            </button>
                            <button type="button" onClick={() => setIsApproveConfirmOpen(true)} disabled={isSubmitting} className="btn w-50 fw-bold text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#198754', borderRadius: '8px', height: '45px' }}>
                                <CheckIcon /> Approve
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="btn btn-link text-muted w-100 mt-2 text-decoration-none shadow-none">Cancel</button>
                </div>
            </div>
            <ConfirmModal
                isOpen={isApproveConfirmOpen}
                title="Approve Return?"
                message="Inventory will not be automatically restocked. Manually add the items back to inventory if they are still usable."
                confirmLabel="Approve"
                variant="success"
                isProcessing={isSubmitting}
                onCancel={() => setIsApproveConfirmOpen(false)}
                onConfirm={handleApprove}
            />
        </div>
    );
};


// --- MAIN COMPONENT ---

export default function Approvals({ pendingPayrolls = [], pendingReturns = [] }) {
    const [activeTab, setActiveTab] = useState('payroll');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal States
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const { flash } = usePage().props;

    // Toast Notifications listener
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Safe fallbacks in case backend passes null
    const safePayrolls = pendingPayrolls || [];
    const safeReturns = pendingReturns || [];

    // Filter Logic
    const filteredPayrolls = safePayrolls.filter(p => {
        const term = searchQuery.toLowerCase();
        const empName = `${p.employee?.firstname} ${p.employee?.lastname}`.toLowerCase();
        return empName.includes(term) || String(p.id).includes(term);
    });

    const filteredReturns = safeReturns.filter(r => {
        const term = searchQuery.toLowerCase();
        return String(r.id).includes(term) || (r.reason && r.reason.toLowerCase().includes(term));
    });

    return (
        <div className="container-fluid py-5 px-5" style={{ minHeight: '100vh', backgroundColor: '#F4F5FA', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Approvals Hub" />
            <Toaster position="top-right" expand={true} richColors />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '32px' }}>Approvals</h2>

                <div className="d-flex gap-4 align-items-center">
                    <div className="d-flex justify-content-center align-items-center rounded-pill px-4" style={{ backgroundColor: '#EBEAEE', width: '300px', height: '48px' }}>
                        <SearchIcon style={{ color: '#6c757d', marginRight: '8px' }} />
                        <input
                            type="text"
                            className="form-control border-0 bg-transparent shadow-none text-start p-0 m-0"
                            placeholder="Search pending..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '14px', color: '#6c757d' }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="card shadow-sm border-0 w-100 overflow-hidden" style={{ borderRadius: '16px', backgroundColor: '#FFF' }}>
                <div className="card-body p-0">
                    
                    {/* Tabs */}
                    <div className="d-flex gap-2 p-4 border-bottom">
                        <button 
                            onClick={() => setActiveTab('payroll')}
                            className="btn fw-semibold border-0 shadow-none px-4 position-relative" 
                            style={{ 
                                backgroundColor: activeTab === 'payroll' ? '#7859FF' : '#EBEAEE', 
                                color: activeTab === 'payroll' ? 'white' : '#5A637A', 
                                borderRadius: '8px', fontSize: '14px', height: '42px'
                            }}
                        >
                            Payroll
                            {safePayrolls.length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                                    {safePayrolls.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('returns')}
                            className="btn fw-semibold border-0 shadow-none px-4 position-relative" 
                            style={{ 
                                backgroundColor: activeTab === 'returns' ? '#7859FF' : '#EBEAEE', 
                                color: activeTab === 'returns' ? 'white' : '#5A637A', 
                                borderRadius: '8px', fontSize: '14px', height: '42px'
                            }}
                        >
                            Returns & Refunds
                            {safeReturns.length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                                    {safeReturns.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* TABLE: PAYROLL */}
                    {activeTab === 'payroll' && (
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0 text-center">
                                <thead style={{ backgroundColor: '#E3E4ED', color: '#1E1E1E' }}>
                                    <tr>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '15%' }}>Payroll ID</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '25%' }}>Employee</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '20%' }}>Gross Pay</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '20%' }}>Status</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '20%' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayrolls.length > 0 ? (
                                        filteredPayrolls.map((row, index) => (
                                            <tr key={row.id} style={{ borderBottom: index !== filteredPayrolls.length - 1 ? '1px solid #F0F0F5' : 'none' }}>
                                                <td className="py-4 fw-bolder text-dark">#TUNGAL{row.id}</td>
                                                <td className="py-4 text-dark fw-medium">
                                                    {row.employee ? `${row.employee.firstname} ${row.employee.lastname}` : `User ID: ${row.employee_id}`}
                                                </td>
                                                <td className="py-4 text-dark fw-bold" style={{ color: '#7859FF' }}>₱{row.gross_pay}</td>
                                                <td className="py-4">
                                                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill" style={{ fontSize: '12px' }}>
                                                        Pending
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedRecord(row);
                                                            setIsPayrollModalOpen(true);
                                                        }}
                                                        className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-white shadow-sm border-0" 
                                                        style={{ backgroundColor: '#7859FF', borderRadius: '8px', padding: '8px 16px', fontSize: '13px' }}
                                                    >
                                                        <ActionIcon /> Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted fw-medium" style={{ fontSize: '15px' }}>No pending payrolls require approval.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TABLE: RETURNS */}
                    {activeTab === 'returns' && (
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle mb-0 text-center">
                                <thead style={{ backgroundColor: '#E3E4ED', color: '#1E1E1E' }}>
                                    <tr>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '15%' }}>Request ID</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '25%' }}>Reason</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '20%' }}>Date</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '20%' }}>Status</th>
                                        <th className="py-4 fw-bold" style={{ fontSize: '14px', width: '20%' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReturns.length > 0 ? (
                                        filteredReturns.map((row, index) => (
                                            <tr key={row.id} style={{ borderBottom: index !== filteredReturns.length - 1 ? '1px solid #F0F0F5' : 'none' }}>
                                                <td className="py-4 fw-bolder text-dark">#TUNGAL{row.id}</td>
                                                <td className="py-4 text-dark fw-medium text-truncate" style={{ maxWidth: '150px' }}>
                                                    {row.reason || 'N/A'}
                                                </td>
                                                <td className="py-4 text-muted">
                                                    {new Date(row.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4">
                                                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill" style={{ fontSize: '12px' }}>
                                                        Under Inspection
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedRecord(row);
                                                            setIsReturnModalOpen(true);
                                                        }}
                                                        className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-white shadow-sm border-0" 
                                                        style={{ backgroundColor: '#7859FF', borderRadius: '8px', padding: '8px 16px', fontSize: '13px' }}
                                                    >
                                                        <ActionIcon /> Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted fw-medium" style={{ fontSize: '15px' }}>No pending returns require approval.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            {/* Modal Mounts */}
            <ReviewPayrollModal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} record={selectedRecord} />
            <ReviewReturnModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} record={selectedRecord} />

        </div>
    );
}

Approvals.layout = page => <AdminLayout children={page} />;
