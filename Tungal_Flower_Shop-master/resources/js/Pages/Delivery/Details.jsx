import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DeliveryLayout from '../../Layout/DeliveryLayout';

function Details({ order }) {
    // Dynamic badge styling matching the system
    let badgeClass = 'bg-info text-white';
    if (order.order_status === 'Delivered') badgeClass = 'bg-primary text-white';
    if (order.order_status === 'Completed - Delivered') badgeClass = 'bg-success text-white';

    return (
        <div className="container-fluid py-4 px-4 d-flex justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            <Head title={`Order #TUNGAL${order.id} Details`} />

            <div style={{ width: '100%', maxWidth: '700px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Link href={route('delivery.dashboard')} className="btn btn-light shadow-sm fw-bold d-flex align-items-center gap-2" style={{ borderRadius: '10px', color: '#1E1E1E' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back to Tasks
                    </Link>
                    <h2 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '24px' }}>Order Details</h2>
                </div>

                <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFF' }}>
                    <div className="card-header border-0 p-4" style={{ backgroundColor: '#7978E9' }}>
                        <h4 className="mb-0 fw-bold text-white text-center">#TUNGAL{order.id}</h4>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <h5 className="fw-bolder mb-3" style={{ color: '#6C63FF', fontSize: '18px' }}>Customer Information</h5>

                        <div className="bg-light p-4 rounded-3 mb-4" style={{ border: '1px solid #EBEAEE' }}>
                            <p className="mb-2 fs-6">
                                <strong className="text-dark me-2">Name:</strong>
                                {order.customer_name || <span className="text-muted fst-italic">Not Provided</span>}
                            </p>
                            <p className="mb-0 fs-6 d-flex align-items-start">
                                <strong className="text-dark me-2" style={{ minWidth: '75px' }}>Address:</strong>
                                <span className="text-dark">{order.customer_address || <span className="text-danger fw-bold">MISSING ADDRESS</span>}</span>
                            </p>
                        </div>

                        {/* INJECTED: Products Bought Section */}
                        <h5 className="fw-bolder mb-3 mt-4" style={{ color: '#6C63FF', fontSize: '18px' }}>Items to Deliver</h5>
                        <div className="mb-4">
                            {order.details && order.details.length > 0 ? (
                                <ul className="list-group list-group-flush rounded-3 border" style={{ borderColor: '#EBEAEE' }}>
                                    {order.details.map((detail, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center bg-light p-3">
                                            <div>
                                                <span className="fw-bold text-dark d-block">{detail.product?.product_name || 'Unknown Item'}</span>
                                                <small className="text-muted">{detail.type_name} (x{detail.multiplier})</small>
                                            </div>
                                            <span className="badge rounded-pill fs-6 px-3" style={{ backgroundColor: '#1E1E1E' }}>
                                                Qty: {detail.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-muted fst-italic">No items found for this order.</div>
                            )}
                        </div>

                        <h5 className="fw-bolder mb-3 mt-4" style={{ color: '#6C63FF', fontSize: '18px' }}>Order Summary</h5>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <strong className="text-muted fw-medium fs-6">Total Price:</strong>
                            <span className="fs-5 fw-bolder text-dark">₱{Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <strong className="text-muted fw-medium fs-6">Payment Method:</strong>
                            <span className="fw-bold text-uppercase" style={{ color: '#7DA0FA' }}>{order.payment_method || 'CASH'}</span>
                        </div>

                        {/* INJECTED: Reference Number if not Cash */}
                        {order.reference_number && (
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <strong className="text-muted fw-medium fs-6">Reference No:</strong>
                                <span className="fw-bold text-dark">{order.reference_number}</span>
                            </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-3 mt-2" style={{ backgroundColor: '#F4F5FA', border: '1px solid #EBEAEE' }}>
                            <strong className="text-dark fw-bold fs-6">Current Status:</strong>
                            <span className={`badge ${badgeClass} px-3 py-2 rounded-pill fw-bold`} style={{ fontSize: '12px' }}>
                                {order.order_status}
                            </span>
                        </div>

                        <div className="mt-5 pt-4 border-top" style={{ borderColor: '#EBEAEE' }}>
                            {order.order_status === 'Delivered' || order.order_status === 'Completed - Delivered' ? (
                                <div className="alert alert-success d-flex align-items-center justify-content-center gap-2 fw-bold border-0 shadow-sm m-0" style={{ borderRadius: '12px', padding: '16px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    This order has been successfully delivered.
                                </div>
                            ) : (
                                <Link href={route('delivery.confirm.show', order.id)} className="btn w-100 py-3 fw-bold shadow-sm text-white d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#6C63FF', borderRadius: '12px', fontSize: '1.1rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    Proceed to Upload Proof
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Details.layout = page => <DeliveryLayout children={page} />;
export default Details;