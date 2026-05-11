import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DeliveryLayout from '../../Layout/DeliveryLayout';

function Dashboard({ orders }) {
    // Filter out 'Walk-in' orders or orders that aren't part of the delivery workflow
    const deliveryOrders = orders.filter(order => 
        ['To be delivered', 'Delivered', 'Completed - Delivered'].includes(order.order_status)
    );

    return (
        <div className="container-fluid py-4 px-4" style={{ minHeight: '100vh', backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Delivery Dashboard" />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '32px', letterSpacing: '-0.5px' }}>Delivery Tasks</h1>
                    <p className="text-muted m-0 mt-1 fw-medium">{deliveryOrders.length} Pending & Completed Tasks</p>
                </div>
            </div>

            <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0 text-center">
                        <thead style={{ backgroundColor: '#E3E4ED', color: '#1E1E1E' }}>
                            <tr>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Order ID</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Delivery Address</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Status</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '13px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryOrders.length > 0 ? (
                                deliveryOrders.map((order, index) => {
                                    
                                    // Dynamic badge styling matching the system
                                    let badgeClass = 'bg-info text-white';
                                    if (order.order_status === 'Delivered') badgeClass = 'bg-primary text-white';
                                    if (order.order_status === 'Completed - Delivered') badgeClass = 'bg-success text-white';

                                    return (
                                        <tr key={order.id} style={{ borderBottom: index !== deliveryOrders.length - 1 ? '1px solid #F0F0F5' : 'none' }}>
                                            <td className="py-3 fw-bolder text-dark" style={{ fontSize: '13px' }}>#TUNGAL{order.id}</td>
                                            <td className="py-3 text-muted fw-medium" style={{ fontSize: '13px', maxWidth: '250px' }}>
                                                <div className="text-truncate">{order.customer_address || 'No Address Provided'}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge ${badgeClass} px-3 py-2 rounded-pill`} style={{ fontSize: '11px' }}>
                                                    {order.order_status}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <Link href={route('delivery.details', order.id)} className="btn btn-sm text-white fw-bold shadow-sm" style={{ backgroundColor: '#6C63FF', borderRadius: '8px', padding: '6px 16px', fontSize: '12px' }}>
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-5">No active delivery tasks available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = page => <DeliveryLayout children={page} />
export default Dashboard;