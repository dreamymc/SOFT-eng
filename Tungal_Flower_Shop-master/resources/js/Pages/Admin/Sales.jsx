import React, { useState } from 'react';
import AdminLayout from '../../Layout/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { IoSearchSharp, IoReceipt } from "react-icons/io5";
import { useRoute } from '../../../../vendor/tightenco/ziggy';

function Sales({ employees, orders, currentSelected_ID }) {
    const route = useRoute();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        order_id: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.searchedOrderID'), {
            onSuccess() {
                reset();
            }
        });
    }

    const handleEmployeeChange = (e) => {
        e.preventDefault();
        const selectedId = e.target.value;
        if (selectedId === 'All') {
            router.get(route('admin.sales'));
        } else {
            router.get(route('admin.selectedEmployee', { user_id: selectedId }));
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderModal = () => {
        setSelectedOrder(null);
    };

    return (
        <div className='py-3' style={{ fontFamily: "'Poppins', sans-serif" }}>
            
            {/* Top Bar: Search & Filter */}
            <div className="row align-items-center gap-4 mb-4">
                <form onSubmit={submit} className='col-md-5 d-flex align-items-center gap-2'>
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        placeholder='Search Order ID'
                        value={data.order_id}
                        onChange={(e) => setData('order_id', e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                    <button type='submit' className='btn btn-primary shadow-sm text-white' disabled={processing} style={{ borderRadius: '8px', backgroundColor: '#6d78e3', borderColor: '#6d78e3' }}>
                        <IoSearchSharp />
                    </button>
                </form>

                <div className="col-md-6 d-flex align-items-center gap-3">
                    <label htmlFor="employee" className="form-label mb-0 fw-bold text-muted">Filter by Employee:</label>
                    <select
                        className="form-select shadow-sm border-0"
                        id="employee"
                        style={{ width: '300px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}
                        onChange={handleEmployeeChange}
                        value={currentSelected_ID}
                    >
                        <option value="All">All Transactions</option>
                        {employees.map(employee => (
                            <option value={employee.id} key={employee.id}>
                                {employee.firstname} {employee.lastname}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Order History Table */}
            <div className="bg-white rounded-3 shadow-sm overflow-hidden border">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-center" style={{ cursor: 'pointer' }}>
                        <thead style={{ backgroundColor: '#F8F9FA', color: '#1E1E1E' }}>
                            <tr>
                                <th className="py-3 fw-bolder text-start ps-4" style={{ fontSize: '14px' }}>Order ID</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Handled By</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Delivered By</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Order Qty</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Total Pieces</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Source Batches</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Total Amount</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Date</th>
                                <th className="py-3 fw-bolder" style={{ fontSize: '14px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order, index) => {
                                    const formattedDate = new Date(order.created_at).toLocaleString("en-US", {
                                        month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
                                    });

                                    // Calculations matching the customer side
                                    const totalPiecesBought = order.details ? order.details.reduce((sum, d) => 
                                        sum + (parseInt(d.quantity) * parseInt(d.multiplier)), 0) : 0;

                                    const allUsedBatches = order.details 
                                        ? [...new Set(order.details.flatMap(d => d.batch_ids ? d.batch_ids.split(', ') : []))].join(', ')
                                        : 'N/A';

                                    const handledBy = order.user ? `${order.user.firstname} ${order.user.lastname}` : 'System';
                                    const deliveredBy = order.delivered_by ? `${order.delivered_by.firstname} ${order.delivered_by.lastname}` : 'N/A';
                                    
                                    // FIXED: Sync Status Colors across the platform
                                    const displayStatus = order.order_status || order.status;
                                    let badgeClass = 'bg-success-subtle text-success'; // default green
                                    if (['Refund Requested', 'Under Inspection'].includes(displayStatus)) {
                                        badgeClass = 'bg-warning text-dark';
                                    } else if (['Refunded', 'Refund Approved', 'Approved'].includes(displayStatus)) {
                                        badgeClass = 'bg-danger text-white';
                                    } else if (displayStatus === 'Received') {
                                        badgeClass = 'bg-primary-subtle text-primary';
                                    }

                                    return (
                                        <tr key={order.id} onClick={() => openOrderModal(order)} style={{ transition: 'background-color 0.2s ease' }} className="table-row-hover">
                                            <td className="py-3 fw-bolder text-dark text-start ps-4" style={{ fontSize: '13px' }}>#TUNGAL{order.id}</td>
                                            <td className="py-3 fw-medium text-secondary" style={{ fontSize: '13px' }}>{handledBy}</td>
                                            <td className="py-3 fw-medium text-secondary" style={{ fontSize: '13px' }}>{deliveredBy}</td>
                                            <td className="py-3 fw-bold text-dark" style={{ fontSize: '13px' }}>{order.quantity} Units</td>
                                            <td className="py-3 text-primary fw-bold" style={{ fontSize: '13px' }}>{totalPiecesBought} Pieces</td>
                                            <td className="py-3 text-muted" style={{ fontSize: '11px', maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {allUsedBatches || 'N/A'}
                                            </td>
                                            <td className="py-3 text-primary fw-bold" style={{ fontSize: '14px' }}>₱{order.total}</td>
                                            <td className="py-3 text-dark" style={{ fontSize: '12px' }}>{formattedDate}</td>
                                            <td className="py-3">
                                                <span className={`badge px-3 py-2 rounded-pill ${badgeClass}`} style={{ fontSize: '11px' }}>
                                                    {displayStatus === 'Approved' ? 'Refunded' : displayStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center text-muted py-5">No transaction history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {orders.data.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4 bg-white p-3 rounded-3 shadow-sm border">
                    <span className="text-muted fw-medium" style={{ fontSize: '14px' }}>
                        Showing {orders.from || 0} to {orders.to || 0} of {orders.total} Entries
                    </span>
                    <div className="d-flex align-items-center gap-2">
                        {orders.links.map((link, index) => (
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`d-flex justify-content-center align-items-center fw-bolder shadow-sm text-decoration-none ${link.active ? 'text-white' : 'text-dark bg-light'}`}
                                    style={{ 
                                        width: '36px', height: '36px', 
                                        backgroundColor: link.active ? '#6d78e3' : '#FFF',
                                        borderRadius: '8px', fontSize: '14px',
                                        border: link.active ? 'none' : '1px solid #DEE2E6'
                                    }}
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '&laquo;').replace('Next', '&raquo;') }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="d-flex justify-content-center align-items-center text-muted bg-light"
                                    style={{ width: '36px', height: '36px', borderRadius: '8px', fontSize: '14px', border: '1px solid #DEE2E6' }}
                                    dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '&laquo;').replace('Next', '&raquo;') }}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* NEW: Comprehensive Order Details Modal */}
            {selectedOrder && (
                <div className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
                    <div className="card shadow-lg border-0" style={{ borderRadius: '16px', width: '100%', maxWidth: '800px', backgroundColor: '#FFF', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div className="card-header border-0 text-white p-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#6d78e3', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                            <h5 className="modal-title fw-bold m-0 d-flex align-items-center gap-2">
                                <IoReceipt className="fs-4"/> Transaction Details: #TUNGAL{selectedOrder.id}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={closeOrderModal}></button>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {/* Metadata Row */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Processed By</p>
                                    <h6 className="fw-bold">{selectedOrder.user ? `${selectedOrder.user.firstname} ${selectedOrder.user.lastname}` : 'N/A'}</h6>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Date & Time</p>
                                    <h6 className="fw-bold">
                                        {new Date(selectedOrder.created_at).toLocaleString("en-US", { month: "long", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </h6>
                                </div>
                                {selectedOrder.delivered_by && (
                                    <div className="col-md-6 mt-3">
                                        <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Delivered By</p>
                                        <h6 className="fw-bold">{`${selectedOrder.delivered_by.firstname} ${selectedOrder.delivered_by.lastname}`}</h6>
                                    </div>
                                )}
                            </div>

                            {/* Financial Summary */}
                            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border mb-4">
                                <div className="text-center">
                                    <span className="d-block text-muted" style={{ fontSize: '12px' }}>Total Amount</span>
                                    <span className="fw-bold fs-5 text-primary">₱{selectedOrder.total}</span>
                                </div>
                                <div className="text-center border-start px-4">
                                    <span className="d-block text-muted" style={{ fontSize: '12px' }}>Cash Received</span>
                                    <span className="fw-bold fs-6">₱{selectedOrder.cash_recieved}</span>
                                </div>
                                <div className="text-center border-start px-4">
                                    <span className="d-block text-muted" style={{ fontSize: '12px' }}>Change Given</span>
                                    <span className="fw-bold fs-6">₱{selectedOrder.change}</span>
                                </div>
                                <div className="text-center border-start ps-4">
                                    <span className="d-block text-muted" style={{ fontSize: '12px' }}>Discount</span>
                                    <span className="fw-bold fs-6 text-danger">{selectedOrder.discount_percentage ? `${selectedOrder.discount_percentage}%` : 'None'}</span>
                                </div>
                            </div>

                            {/* Itemized Cart Table */}
                            <h6 className="fw-bold text-secondary mb-3">Item Breakdown</h6>
                            <div className="table-responsive border rounded-3 mb-4">
                                <table className="table table-borderless align-middle mb-0 text-center">
                                    <thead className="bg-light text-muted" style={{ fontSize: '12px' }}>
                                        <tr>
                                            <th className="text-start ps-3">Product</th>
                                            <th>Variant Type</th>
                                            <th>Base Pcs</th>
                                            <th>Subtotal</th>
                                            <th className="pe-3">Batches Deducted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.details && selectedOrder.details.length > 0 ? (
                                            selectedOrder.details.map((item, idx) => (
                                                <tr key={idx} className="border-bottom">
                                                    <td className="text-start ps-3 fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                        {item.product ? item.product.product_name : 'Deleted Product'}
                                                    </td>
                                                    <td style={{ fontSize: '13px' }}>{item.quantity} {item.type_name}</td>
                                                    <td className="text-primary fw-bold" style={{ fontSize: '13px' }}>{item.quantity * item.multiplier}</td>
                                                    <td className="fw-bold text-primary" style={{ fontSize: '13px' }}>₱{item.total}</td>
                                                    <td className="pe-3 text-muted" style={{ fontSize: '11px' }}>{item.batch_ids || 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5" className="text-muted py-3">No details available.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Delivery Proof */}
                            {selectedOrder.delivery_proof && (
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="fw-bold text-secondary mb-3">Proof of Delivery</h6>
                                    <div className="bg-light p-3 rounded-3 text-center border">
                                        <img 
                                            src={(selectedOrder.delivery_proof?.startsWith('http') ? selectedOrder.delivery_proof : `/storage/${selectedOrder.delivery_proof}`)} 
                                            alt="Delivery Proof" 
                                            className="img-fluid rounded shadow-sm" 
                                            style={{ maxHeight: '300px', objectFit: 'contain' }} 
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="card-footer bg-white border-top-0 d-flex justify-content-end p-4">
                            <button type="button" className="btn btn-secondary px-4 fw-bold shadow-sm" onClick={closeOrderModal} style={{ borderRadius: '8px' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .table-row-hover:hover {
                    background-color: #F8F9FA !important;
                }
            `}</style>
        </div>
    );
}

Sales.layout = page => <AdminLayout children={page} />;
export default Sales;
