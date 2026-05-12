import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layout/AdminLayout';

// --- CUSTOM ICONS ---
const ViewIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
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

// INJECTED: Centralized Status Badge styling logic
const getStatusBadge = (status) => {
    if (status === 'Approved' || status === 'Refunded') return 'bg-success text-white';
    if (status === 'Rejected') return 'bg-danger text-white';
    return 'bg-warning text-dark';
};

// --- VIEW DETAILS MODAL ---
const ViewReturnModal = ({ isOpen, onClose, record }) => {
    if (!isOpen || !record) return null;

    const req = record.raw_request;
    
    // Formatting Dates safely
    const dateBought = req.order?.created_at ? new Date(req.order.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : 'N/A';
    const dateRefunded = req.created_at ? new Date(req.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : 'N/A';
    
    // Extracting Cashier safely
    const cashierName = req.cashier ? `${req.cashier.firstname} ${req.cashier.lastname}` : 'Unknown Cashier';

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.6)', zIndex: 1050 }}>
            <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '24px', width: '100%', maxWidth: '650px', backgroundColor: '#FFF' }}>
                
                {/* Modal Header */}
                <div className="card-header border-0 text-white p-4" style={{ backgroundColor: '#758AF8' }}>
                    <h4 className="fw-bolder m-0 d-flex justify-content-between align-items-center">
                        Return Details
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </h4>
                </div>

                <div className="card-body p-4 p-md-5">
                    
                    {/* Top Identifiers */}
                    <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                        <div>
                            <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice Number</span>
                            <h3 className="fw-bolder text-dark m-0">{record.invoice}</h3>
                        </div>
                        <div className="text-end">
                            <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                            {/* FIXED: Synced Badge Colors using ternary helper */}
                            <span className={`badge px-3 py-2 rounded-pill fs-6 ${getStatusBadge(record.status)}`}>
                                {record.status === 'Approved' ? 'Refunded' : record.status}
                            </span>
                        </div>
                    </div>

                    {/* INJECTED: Display rejection reason if applicable */}
                    {record.status === 'Rejected' && req.rejection_reason && (
                        <div className="mb-4">
                            <span className="text-danger fw-bold d-block mb-2" style={{ fontSize: '13px' }}>Rejection Reason (Admin)</span>
                            <div className="p-3 rounded bg-light text-dark fw-medium border border-danger" style={{ minHeight: '60px' }}>
                                {req.rejection_reason}
                            </div>
                        </div>
                    )}

                    {/* Timeline & Personnel Grid */}
                    <div className="row g-4 mb-4">
                        <div className="col-6">
                            <span className="text-muted fw-medium d-block mb-1" style={{ fontSize: '13px' }}>Date Bought</span>
                            <span className="fw-bold text-dark">{dateBought}</span>
                        </div>
                        <div className="col-6">
                            <span className="text-muted fw-medium d-block mb-1" style={{ fontSize: '13px' }}>Date Refunded</span>
                            <span className="fw-bold text-dark">{dateRefunded}</span>
                        </div>
                        <div className="col-6">
                            <span className="text-muted fw-medium d-block mb-1" style={{ fontSize: '13px' }}>Processed By</span>
                            <span className="fw-bold text-dark">{cashierName}</span>
                        </div>
                        <div className="col-6">
                            <span className="text-muted fw-medium d-block mb-1" style={{ fontSize: '13px' }}>Refund Method</span>
                            <span className="fw-bold text-dark">{req.refund_method || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Specific Item Details */}
                    <div className="p-3 mb-4 rounded" style={{ backgroundColor: '#F8F9FA', border: '1px solid #EBEAEE' }}>
                        <span className="text-muted fw-bold d-block mb-2" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Item Returned</span>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-bolder text-dark fs-5 d-block">{record.flower_name}</span>
                                <span className="text-muted fw-medium">Type: {record.type}</span>
                            </div>
                            <div className="text-end">
                                <span className="fw-bolder text-dark fs-5 d-block">x{record.quantity}</span>
                                <span className="text-muted fw-medium">Qty</span>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                        <span className="text-muted fw-medium d-block mb-2" style={{ fontSize: '13px' }}>Reason for Return (Cashier Notes)</span>
                        <div className="p-3 rounded bg-light text-dark fw-medium" style={{ border: '1px solid #EBEAEE', minHeight: '80px' }}>
                            {record.reason}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end">
                        <button type="button" onClick={onClose} className="btn fw-bold px-5 text-white shadow-none" style={{ backgroundColor: '#6C757D', borderRadius: '8px', height: '45px' }}>
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default function Returns({ returns }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Flattens the nested data and attaches the raw backend objects so the modal can use them
    const tableRows = [];
    if (returns && returns.data) {
        returns.data.forEach((request) => {
            if (request.order && request.order.details) {
                request.order.details.forEach((detail) => {
                    tableRows.push({
                        return_id: request.id,
                        flower_id: detail.product_id,
                        flower_name: detail.product?.product_name || 'Unknown',
                        type: detail.type_name || 'Base Unit',
                        quantity: detail.quantity,
                        reason: request.reason,
                        status: request.status,
                        invoice: `#TUNGAL${request.order_id}`,
                        // Attach raw data for the View details modal
                        raw_request: request, 
                        raw_detail: detail
                    });
                });
            }
        });
    }

    const openViewModal = (row) => {
        setSelectedRecord(row);
        setIsViewModalOpen(true);
    };

    return (
        <div className="container-fluid py-4 px-4" style={{ minHeight: '100vh', backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Returns Management" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '32px', letterSpacing: '-0.5px' }}>Returns</h1>
                
                <div className="position-relative">
                    <input 
                        type="text" 
                        className="form-control shadow-none border-0 text-center fw-medium" 
                        placeholder="Search Returns"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ backgroundColor: '#EBE9F1', borderRadius: '50px', width: '300px', height: '42px', color: '#5A637A' }} 
                    />
                </div>
            </div>

            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0 text-center table-hover">
                        <thead style={{ backgroundColor: '#E3E4ED', color: '#1E1E1E' }}>
                            <tr>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>INVOICE#</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Flower</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Type</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Quantity</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Reason</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Status</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.length > 0 ? (
                                tableRows.map((row, index) => {
                                    const displayStatus = row.status === 'Approved' ? 'Refunded' : row.status;

                                    return (
                                        <tr 
                                            key={`${row.return_id}-${row.flower_id}`} 
                                            style={{ borderBottom: index !== tableRows.length - 1 ? '1px solid #F0F0F5' : 'none', cursor: 'pointer' }}
                                            onClick={() => openViewModal(row)}
                                        >
                                            <td className="py-3 fw-bold text-dark" style={{ fontSize: '14px' }}>{row.invoice}</td>
                                            <td className="py-3 fw-bold text-dark" style={{ fontSize: '14px' }}>{row.flower_name}</td>
                                            <td className="py-3 text-dark" style={{ fontSize: '14px' }}>{row.type}</td>
                                            <td className="py-3 fw-bold text-dark" style={{ fontSize: '14px' }}>{row.quantity}</td>
                                            <td className="py-3 text-dark" style={{ fontSize: '14px' }}>{row.reason}</td>
                                            <td className="py-3">
                                                {/* FIXED: Applied standardized status badge */}
                                                <span className={`badge px-3 py-2 rounded-pill ${getStatusBadge(row.status)}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <button 
                                                    className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm text-dark" 
                                                    style={{ backgroundColor: '#E3E4ED', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', border: 'none' }}
                                                    onClick={(e) => { e.stopPropagation(); openViewModal(row); }}
                                                >
                                                    <ViewIcon /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">No active return requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CUSTOM STYLED PAGINATION */}
            {returns && returns.data && returns.data.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <span className="text-muted fw-medium" style={{ fontSize: '14px' }}>
                        Showing {returns.from || 0} to {returns.to || 0} of {returns.total} Entries
                    </span>
                    <div className="d-flex align-items-center gap-2">
                        {returns.links.map((link, index) => (
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`d-flex justify-content-center align-items-center fw-bolder shadow-sm text-decoration-none ${link.active ? 'text-white' : 'text-dark bg-white'}`}
                                    style={{ 
                                        width: '36px', height: '36px', 
                                        backgroundColor: link.active ? '#758AF8' : '#FFF',
                                        borderRadius: '8px', fontSize: '14px',
                                        border: link.active ? 'none' : '1px solid #EBEAEE'
                                    }}
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '&laquo;').replace('Next', '&raquo;') }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="d-flex justify-content-center align-items-center text-muted bg-light"
                                    style={{ width: '36px', height: '36px', borderRadius: '8px', fontSize: '14px', border: '1px solid #EBEAEE' }}
                                    dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '&laquo;').replace('Next', '&raquo;') }}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* MOUNT MODAL */}
            <ViewReturnModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} record={selectedRecord} />

        </div>
    );
}

Returns.layout = page => <AdminLayout children={page} />;