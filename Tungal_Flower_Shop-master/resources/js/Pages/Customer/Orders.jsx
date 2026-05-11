import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../Layout/CustomerLayout';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { IoReceipt } from "react-icons/io5";
import { useRoute } from '../../../../vendor/tightenco/ziggy/';
import { Toaster, toast } from 'sonner';

// --- CUSTOM ICONS ---
const ArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const ArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 19"></polyline></svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

function Orders({ orders }) {
    const route = useRoute();
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    
    const [refundStep, setRefundStep] = useState(0);

    const { data, setData, post, processing, reset } = useForm({
        invoiceNum: '',
        reason: '',
        method: ''
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const openReturnModal = (orderId) => {
        setData({ invoiceNum: orderId ? `#TUNGAL${orderId}` : '', reason: '', method: '' });
        setRefundStep(1);
    };

    const handleCloseRefund = () => {
        setRefundStep(0);
        reset();
    };

    const nextStep = () => setRefundStep(prev => prev + 1);
    const prevStep = () => setRefundStep(prev => prev - 1);

    const submitRefundRequest = (e) => {
        e.preventDefault();
        post(route('customer.return.store'), {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseRefund();
            }
        });
    };

    const handleConfirmPayment = (orderId) => {
        const confirmed = window.confirm("Are you sure you want to finalize this order? This confirms the delivery driver has handed over the payment.");
        if (confirmed) {
            router.post(route('customer.orders.finalizePayment', { id: orderId }), {}, {
                preserveScroll: true,
            });
        }
    };

    // Expanded to include new delivery workflow statuses
    const blockedRefundStatuses = [
        'Under Inspection', 
        'Refund Requested', 
        'Refund Approved', 
        'Refunded',
        'To be delivered',
        'Delivered'
    ];

    return (
        <div className="container-fluid py-4 px-4" style={{ minHeight: '100vh', backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            <Toaster position="top-right" richColors expand={true} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '32px', letterSpacing: '-0.5px' }}>Order History</h1>
                    <p className="text-muted m-0 mt-1 fw-medium">{orders.total} Total Orders</p>
                </div>
                
                <div className="position-relative">
                    <input 
                        type="text" 
                        className="form-control shadow-none border-0 text-center fw-medium" 
                        placeholder="Search Orders"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ backgroundColor: '#EBE9F1', borderRadius: '50px', width: '300px', height: '42px', color: '#5A637A' }} 
                    />
                </div>
            </div>

            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0 text-center">
                        <thead style={{ backgroundColor: '#E3E4ED', color: '#1E1E1E' }}>
                            <tr>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Order ID</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Order Qty</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Total Pieces</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Type</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Total Amount</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Date</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Status</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order, index) => {
                                    const formattedDate = new Date(order.updated_at).toLocaleString("en-US", {
                                        month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
                                    });

                                    const orderId = order.details.length > 0 ? order.details[0].order_id : order.id;

                                    const totalPiecesBought = order.details ? order.details.reduce((sum, d) => 
                                        sum + (parseInt(d.quantity) * parseInt(d.multiplier)), 0) : 0;

                                    // Safely grab status handling both potential names
                                    const displayStatus = order.order_status || order.status || 'Completed - Shop';

                                    // Dynamic badge coloring
                                    let badgeClass = 'bg-success-subtle text-success';
                                    if (displayStatus === 'To be delivered') badgeClass = 'bg-info text-white';
                                    if (displayStatus === 'Delivered') badgeClass = 'bg-primary text-white';
                                    if (displayStatus === 'Refunded') badgeClass = 'bg-danger text-white';
                                    if (['Under Inspection', 'Refund Requested'].includes(displayStatus)) badgeClass = 'bg-warning text-dark';

                                    return (
                                        <tr key={order.id} style={{ borderBottom: index !== orders.data.length - 1 ? '1px solid #F0F0F5' : 'none' }}>
                                            <td className="py-3 fw-bolder text-dark" style={{ fontSize: '13px' }}>{orderId ? `#TUNGAL${orderId}` : 'N/A'}</td>
                                            <td className="py-3 fw-bold text-dark" style={{ fontSize: '13px' }}>{order.quantity} Units</td>
                                            <td className="py-3 text-primary fw-bold" style={{ fontSize: '13px' }}>{totalPiecesBought} Pieces</td>
                                            
                                            {/* ADDED: Order Type Display */}
                                            <td className="py-3 fw-bold" style={{ fontSize: '13px', color: order.order_type === 'Delivery' ? '#db8435' : '#707584' }}>
                                                {order.order_type || 'Walk-in'}
                                            </td>

                                            <td className="py-3 text-dark fw-bold" style={{ fontSize: '13px' }}>₱{order.total}</td>
                                            <td className="py-3 text-dark" style={{ fontSize: '12px' }}>{formattedDate}</td>
                                            <td className="py-3">
                                                <span className={`badge px-3 py-2 rounded-pill ${badgeClass}`} style={{ fontSize: '11px' }}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    
                                                    {orderId && (
                                                        <Link href={route('customer.invoice', { order_id: orderId })} className="btn btn-sm btn-light shadow-sm d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px', borderRadius: '8px' }} title="View Invoice">
                                                            <IoReceipt className="fs-5 text-dark" />
                                                        </Link>
                                                    )}
                                                    
                                                    {/* ADDED: Cashier Handoff Confirmation Button */}
                                                    {displayStatus === 'Delivered' && (
                                                        <button 
                                                            onClick={() => handleConfirmPayment(order.id)} 
                                                            className="btn btn-sm text-white d-flex align-items-center gap-1 shadow-sm" 
                                                            style={{ backgroundColor: '#28A745', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', border: 'none' }} 
                                                            title="Confirm Payment Received from Driver"
                                                        >
                                                            <CheckIcon /> Receive Payment
                                                        </button>
                                                    )}

                                                    {/* Hide Refund button if it's pending/refunded OR currently in the delivery process */}
                                                    {!blockedRefundStatuses.includes(displayStatus) && (
                                                        <button onClick={() => openReturnModal(orderId)} className="btn btn-sm text-white" style={{ backgroundColor: '#D9534F', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', border: 'none' }} title="Request Refund">
                                                            Refund
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-5">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {orders.data.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <span className="text-muted fw-medium" style={{ fontSize: '14px' }}>
                        Showing {orders.from || 0} to {orders.to || 0} of {orders.total} Entries
                    </span>
                    <div className="d-flex align-items-center gap-2">
                        {orders.links.map((link, index) => (
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

            {/* ORIGINAL 3-STEP MODAL EXACTLY AS PROVIDED */}
            {refundStep > 0 && (
                <div className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
                    <div className="card shadow-lg border-0" style={{ borderRadius: '16px', width: '100%', maxWidth: '450px', backgroundColor: '#FFF' }}>
                        
                        <div className="card-header border-0 text-white p-4" style={{ backgroundColor: '#7DA0FA', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                            <h4 className="modal-title fw-bold m-0 d-flex justify-content-between align-items-center">
                                {refundStep === 1 || refundStep === 3 ? 'Request Refund' : 'Choose Refund Method'}
                                <button type="button" className="btn-close btn-close-white" onClick={handleCloseRefund}></button>
                            </h4>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {refundStep === 1 && (
                                <div>
                                    <p className="text-muted fw-medium mb-4" style={{ fontSize: '14px' }}>Please indicate the required details of your refund request.</p>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Invoice #</label>
                                        <input type="text" className="form-control shadow-none bg-light" style={{ borderRadius: '8px', border: '1px solid #DEE2E6', cursor: 'not-allowed' }} value={data.invoiceNum} readOnly />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Reason</label>
                                        <textarea className="form-control shadow-none" rows="4" style={{ borderRadius: '8px', backgroundColor: '#F8F9FA', resize: 'none' }} value={data.reason} onChange={e => setData('reason', e.target.value)}></textarea>
                                    </div>
                                    <div className="d-flex justify-content-end gap-3 mt-4">
                                        <button type="button" className="btn fw-bold px-4 text-white shadow-none" onClick={handleCloseRefund} style={{ backgroundColor: '#DC3545', borderRadius: '8px', width: '120px' }}>Cancel</button>
                                        <button type="button" className="btn fw-bold px-4 text-white shadow-none" onClick={nextStep} disabled={!data.invoiceNum || !data.reason} style={{ backgroundColor: '#7DA0FA', borderRadius: '8px', width: '120px' }}>Next</button>
                                    </div>
                                </div>
                            )}

                            {refundStep === 2 && (
                                <div>
                                    <p className="text-muted fw-medium mb-4" style={{ fontSize: '14px' }}>How would you like to receive your refund?</p>
                                    <div className="mb-5">
                                        <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Refund Method</label>
                                        <select className="form-select shadow-none" style={{ borderRadius: '8px', backgroundColor: '#F8F9FA' }} value={data.method} onChange={e => setData('method', e.target.value)}>
                                            <option value="" disabled>Select a Method</option>
                                            <option value="Gcash">GCash</option>
                                            <option value="Bank">Bank Transfer</option>
                                            <option value="Cash">Cash (In-Store)</option>
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end gap-3 mt-4">
                                        <button type="button" className="btn fw-bold px-4 text-white shadow-none" onClick={prevStep} style={{ backgroundColor: '#DC3545', borderRadius: '8px', width: '120px' }}>Back</button>
                                        <button type="button" className="btn fw-bold px-4 text-white shadow-none" onClick={nextStep} disabled={!data.method} style={{ backgroundColor: '#7DA0FA', borderRadius: '8px', width: '120px' }}>Next</button>
                                    </div>
                                </div>
                            )}

                            {refundStep === 3 && (
                                <form onSubmit={submitRefundRequest}>
                                    <p className="text-muted fw-medium mb-4" style={{ fontSize: '14px' }}>Please confirm the details below.</p>
                                    <div className="d-flex flex-column gap-3 mb-5">
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Invoice #</span>
                                            <div className="form-control shadow-none bg-light" style={{ borderRadius: '8px', border: '1px solid #EBEAEE' }}>{data.invoiceNum}</div>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Refund Method</span>
                                            <div className="form-control shadow-none bg-light" style={{ borderRadius: '8px', border: '1px solid #EBEAEE' }}>{data.method}</div>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Reason</span>
                                            <div className="form-control shadow-none bg-light p-2" style={{ borderRadius: '8px', border: '1px solid #EBEAEE', minHeight: '80px', wordBreak: 'break-word' }}>{data.reason}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-3 mt-4">
                                        <button type="button" className="btn fw-bold px-4 text-white shadow-none" onClick={prevStep} style={{ backgroundColor: '#DC3545', borderRadius: '8px', width: '120px' }}>Back</button>
                                        <button type="submit" disabled={processing} className="btn fw-bold px-4 text-white shadow-none" style={{ backgroundColor: '#28A745', borderRadius: '8px', width: '120px' }}>
                                            {processing ? 'Confirming...' : 'Confirm'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

Orders.layout = page => <CustomerLayout children={page} />;
export default Orders;