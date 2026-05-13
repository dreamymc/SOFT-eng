import React from 'react';
import CustomerLayout from '../Layout/CustomerLayout';
import { useRoute } from '../../../vendor/tightenco/ziggy';
import { FaDownload, FaArrowLeft } from "react-icons/fa6";
import { Link } from '@inertiajs/react';

function InvoiceReceipt({ order, orderDetails }) {
    const route = useRoute();

    if (!order || !orderDetails || orderDetails.length === 0) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center">
                    Error: No order data available to generate invoice.
                </div>
            </div>
        );
    }

    const rawOrderId = String(orderDetails[0]?.order_id || 'N/A');
    const numericId = rawOrderId.replace(/[^0-9]/g, '');
    const displayOrderId = `#TUNGAL${numericId}`;

    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          });

    const formattedTime = order.created_at
        ? new Date(order.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
          })
        : new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
          });

    const handleDownload = () => {
        window.print();
    };

    return (
        <div 
            className="min-vh-100 py-4 py-md-5 d-flex flex-column align-items-center font-sans invoice-page-wrapper"
            style={{ backgroundColor: '#F4F5FA' }}
        >
            {/* Toolbar */}
            <div className="w-100 mb-4 d-flex justify-content-between align-items-center d-print-none px-3 px-md-0" style={{ maxWidth: '400px' }}>
                <Link
                    href={route('customer.orders')}
                    className="btn btn-light border d-flex align-items-center gap-2 fw-semibold shadow-sm"
                    style={{ borderRadius: '8px' }}
                >
                    <FaArrowLeft />
                    <span>Back</span>
                </Link>

                <button
                    onClick={handleDownload}
                    className="btn text-white d-flex align-items-center gap-2 fw-semibold shadow-sm border-0"
                    style={{ backgroundColor: '#6C63FF', borderRadius: '8px' }}
                >
                    <FaDownload />
                    <span>Print</span>
                </button>
            </div>

            {/* Thermal POS Receipt Document */}
            <div 
                className="bg-white shadow-sm mx-auto invoice-doc-wrapper position-relative"
                style={{ 
                    width: '400px',
                    padding: '40px 30px',
                    borderRadius: '0px', // Thermal receipts aren't rounded
                    WebkitPrintColorAdjust: 'exact', 
                    printColorAdjust: 'exact',
                    borderTop: '8px solid #6C63FF',
                    fontFamily: "'Courier New', Courier, monospace" // POS thermal look
                }}
            >
                {/* Header Section */}
                <div className="text-center mb-4">
                    <h2 className="fw-bolder mb-1" style={{ color: '#1E1E1E', letterSpacing: '1px' }}>TUNGAL'S</h2>
                    <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '2px' }}>Flower Shop</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Purok 7 Los Amigos, Tugbok District, Davao City</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Tel: 09154976147</p>
                </div>

                <div className="border-top border-bottom border-2 border-dark py-2 mb-4 d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between" style={{ fontSize: '13px' }}>
                        <span className="fw-bold text-dark">Receipt No:</span>
                        <span className="fw-bold text-dark">{displayOrderId}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '13px' }}>
                        <span className="text-muted">Date:</span>
                        <span className="text-dark">{formattedDate} {formattedTime}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '13px' }}>
                        <span className="text-muted">Cashier:</span>
                        <span className="text-dark">{order.user?.firstname} {order.user?.lastname}</span>
                    </div>
                </div>

                {/* Customer & Delivery Section */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                        <span className="fw-bold text-dark">Order Type:</span>
                        <span className="fw-bold text-dark text-uppercase">{order.order_type}</span>
                    </div>
                    {(order.customer_name || order.customer_address) && (
                        <div className="bg-light p-2 mt-2" style={{ borderLeft: '3px solid #6C63FF' }}>
                            {order.customer_name && (
                                <div style={{ fontSize: '12px' }}><span className="fw-bold">Customer:</span> {order.customer_name}</div>
                            )}
                            {order.customer_address && (
                                <div style={{ fontSize: '12px' }}><span className="fw-bold">Deliver To:</span> {order.customer_address}</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Itemized Table */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between fw-bold border-bottom border-dark pb-2 mb-2 text-uppercase" style={{ fontSize: '12px' }}>
                        <span style={{ width: '50%' }}>Item</span>
                        <span style={{ width: '15%', textAlign: 'center' }}>Qty</span>
                        <span style={{ width: '35%', textAlign: 'right' }}>Amount</span>
                    </div>

                    {orderDetails.map((detail, index) => (
                        <div key={detail.id || index} className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                            <div style={{ width: '50%' }}>
                                <div className="fw-bold text-dark">{detail.product ? detail.product.product_name : 'Unknown Item'}</div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>{detail.type_name} (x{detail.multiplier})</div>
                            </div>
                            <div style={{ width: '15%', textAlign: 'center', paddingTop: '2px' }}>
                                {detail.quantity}
                            </div>
                            <div className="fw-bold" style={{ width: '35%', textAlign: 'right', paddingTop: '2px' }}>
                                ₱{Number(detail.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals Section */}
                <div className="border-top border-dark pt-3 mb-4">
                    {Number(order.discount_amount) > 0 && (
                        <>
                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                                <span className="text-muted">Subtotal</span>
                                <span>₱{(Number(order.total) + Number(order.discount_amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-danger" style={{ fontSize: '13px' }}>
                                <span>Discount ({order.discount_percentage}%)</span>
                                <span>-₱{Number(order.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bolder text-uppercase" style={{ fontSize: '18px' }}>Total Due</span>
                        <span className="fw-bolder" style={{ fontSize: '22px' }}>
                            ₱{Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Payment Info */}
                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                        <span className="text-muted">Payment Method</span>
                        <span className="fw-bold text-uppercase">{order.payment_method}</span>
                    </div>

                    {['Gcash', 'Bank Transfer'].includes(order.payment_method) && order.reference_number && (
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                            <span className="text-muted">Ref No.</span>
                            <span className="fw-bold">{order.reference_number}</span>
                        </div>
                    )}

                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                        <span className="text-muted">Amount Tendered</span>
                        <span>₱{Number(order.cash_recieved || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '13px' }}>
                        <span className="text-muted">Change</span>
                        <span>₱{Number(order.change || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-5">
                    <p className="fw-bold mb-1" style={{ fontSize: '14px' }}>THANK YOU FOR YOUR PURCHASE!</p>
                    <p className="text-muted" style={{ fontSize: '11px' }}>Please keep this receipt for returns/refunds.</p>
                    
                    {/* Barcode Mockup */}
                    <div className="mt-4 opacity-50" style={{ fontFamily: "'Libre Barcode 39', cursive", fontSize: '40px' }}>
                        *{numericId}*
                    </div>
                </div>
            </div>

            {/* Failsafe Hardware Print Styles */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap');
                    
                    @media print {
                        @page {
                            margin: 0;
                            size: 80mm 200mm; /* Standard Thermal Roll Width */
                        }
                        body, html {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .invoice-page-wrapper {
                            background: white !important;
                            padding: 0 !important;
                            align-items: flex-start !important;
                        }
                        .invoice-doc-wrapper {
                            border-top: none !important;
                            box-shadow: none !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            padding: 10px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

InvoiceReceipt.layout = page => <CustomerLayout children={page} />;

export default InvoiceReceipt;