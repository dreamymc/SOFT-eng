import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DeliveryLayout from '../../Layout/DeliveryLayout';

function Dashboard({ orders }) {
    // Filter out 'Walk-in' orders or orders that aren't part of the delivery workflow
    const deliveryOrders = orders.filter(order => 
        ['To be delivered', 'Delivered', 'Completed - Delivered'].includes(order.order_status)
    );

    return (
        <div className="container py-4">
            <Head title="Delivery Dashboard" />
            <h2 className="mb-4 fw-bolder">Delivery Tasks</h2>
            
            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 text-center align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th className="py-3">Order ID</th>
                                    <th className="py-3">Address</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryOrders.length > 0 ? (
                                    deliveryOrders.map(order => {
                                        
                                        // Dynamic badge styling
                                        let badgeClass = 'bg-warning text-dark';
                                        if (order.order_status === 'Delivered') badgeClass = 'bg-primary';
                                        if (order.order_status === 'Completed - Delivered') badgeClass = 'bg-success';

                                        return (
                                            <tr key={order.id}>
                                                <td className="fw-bold text-dark">#TUNGAL{order.id}</td>
                                                <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                                                    {order.customer_address || 'No Address Provided'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${badgeClass} px-3 py-2 rounded-pill`}>
                                                        {order.order_status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link href={route('delivery.details', order.id)} className="btn btn-sm text-white fw-bold shadow-sm" style={{ backgroundColor: '#6C63FF', borderRadius: '6px' }}>
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-5 text-muted fw-bold">No active delivery tasks available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = page => <DeliveryLayout children={page} />
export default Dashboard;