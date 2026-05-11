import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DeliveryLayout from '../../Layout/DeliveryLayout';

function Details({ order }) {
    // Dynamic badge styling
    let badgeClass = 'bg-warning text-dark';
    if (order.order_status === 'Delivered') badgeClass = 'bg-primary text-white';
    if (order.order_status === 'Completed - Delivered') badgeClass = 'bg-success text-white';

    return (
        <div className="container py-4" style={{ maxWidth: '600px' }}>
            <Head title={`Order #TUNGAL${order.id} Details`} />
            
            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header text-white d-flex justify-content-between align-items-center py-3 border-0" style={{ backgroundColor: '#1E1E1E' }}>
                    <h5 className="mb-0 fw-bold">Order #TUNGAL{order.id}</h5>
                    <Link href={route('delivery.dashboard')} className="btn btn-sm btn-light fw-bold" style={{ borderRadius: '6px' }}>Back</Link>
                </div>
                
                <div className="card-body p-4">
                    <h5 className="border-bottom pb-2 fw-bold" style={{ color: '#6C63FF' }}>Customer Information</h5>
                    
                    <div className="bg-light p-3 rounded mt-3 mb-4">
                        <p className="mb-2 fs-6">
                            <strong className="text-dark me-2">Name:</strong> 
                            {order.customer_name || <span className="text-muted fst-italic">Not Provided</span>}
                        </p>
                        <p className="mb-0 fs-6 d-flex">
                            <strong className="text-dark me-2" style={{ minWidth: '70px' }}>Address:</strong> 
                            <span className="text-dark">{order.customer_address || <span className="text-danger fw-bold">MISSING ADDRESS</span>}</span>
                        </p>
                    </div>
                    
                    <h5 className="border-bottom pb-2 mt-4 fw-bold" style={{ color: '#6C63FF' }}>Order Summary</h5>
                    <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                        <strong className="text-dark">Total Price:</strong>
                        <span className="fs-5 fw-bold text-dark">₱{Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <strong className="text-dark">Payment Method:</strong>
                        <span className="fw-bold text-uppercase text-secondary">{order.payment_method || 'CASH'}</span>
                    </div>

                    <div className="d-flex align-items-center p-3 rounded" style={{ backgroundColor: '#F4F5FA' }}>
                        <strong className="text-dark me-auto">Current Status:</strong>
                        <span className={`badge ${badgeClass} px-3 py-2 rounded-pill fs-6`}>
                            {order.order_status}
                        </span>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                        {order.order_status === 'Delivered' || order.order_status === 'Completed - Delivered' ? (
                            <div className="alert alert-success text-center fw-bold border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                                ✔ This order has been successfully delivered.
                            </div>
                        ) : (
                            <Link href={route('delivery.confirm.show', order.id)} className="btn w-100 py-3 fw-bold shadow-sm text-white" style={{ backgroundColor: '#28A745', borderRadius: '10px', fontSize: '1.1rem' }}>
                                Proceed to Upload Proof
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Forces the page to use the Delivery Sidebar instead of the Customer default
Details.layout = page => <DeliveryLayout children={page} />;
export default Details;