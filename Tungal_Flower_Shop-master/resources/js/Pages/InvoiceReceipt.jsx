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

    // Explicitly formatting exactly as requested: #TUNGAL1, #TUNGAL2
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

    const handleDownload = () => {
        window.print();
    };

    return (
        <div 
            className="min-vh-100 py-4 py-md-5 d-flex flex-column align-items-center font-sans invoice-page-wrapper"
            style={{ backgroundColor: '#dcdcdc' }}
        >
            {/* Toolbar */}
            <div className="w-100 mb-4 d-flex justify-content-between align-items-center d-print-none px-3 px-md-0" style={{ maxWidth: '900px' }}>
                <Link
                    href={route('customer.orders')}
                    className="btn btn-light border d-flex align-items-center gap-2 fw-semibold shadow-sm"
                >
                    <FaArrowLeft />
                    <span>Back to History</span>
                </Link>

                <button
                    onClick={handleDownload}
                    className="btn text-white d-flex align-items-center gap-2 fw-semibold shadow-sm border-0"
                    style={{ backgroundColor: '#7272e8' }}
                >
                    <FaDownload />
                    <span>Save Invoice</span>
                </button>
            </div>

            {/* Invoice Document */}
            <div 
                className="w-100 bg-white shadow-lg mx-auto invoice-doc-wrapper"
                style={{ 
                    maxWidth: '900px', 
                    WebkitPrintColorAdjust: 'exact', 
                    printColorAdjust: 'exact' 
                }}
            >
                {/* Header */}
                <div 
                    className="text-white p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4"
                    style={{ backgroundColor: '#7272e8' }}
                >
                    <div>
                        <h1 className="display-3 fw-light mb-0 lh-1">
                            Invoice
                        </h1>
                        <div className="mt-2 small text-uppercase opacity-75" style={{ letterSpacing: '1px' }}>
                            TUNGAL'S FLOWER SHOP
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-3 border-start-0 border-md-start border-light ps-0 ps-md-4 w-100 w-md-auto">
                        <div className="d-flex justify-content-between gap-5 fs-6">
                            <span className="opacity-75">Invoice #</span>
                            <span className="fw-medium">
                                {displayOrderId}
                            </span>
                        </div>

                        <div className="d-flex justify-content-between gap-5 fs-6">
                            <span className="opacity-75">Issue Date</span>
                            <span className="fw-medium">{formattedDate}</span>
                        </div>

                        <div className="d-flex justify-content-between gap-5 fs-6">
                            <span className="opacity-75">Due Date</span>
                            <span className="fw-medium">{formattedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 p-md-5">
                    {/* Total */}
                    <div className="text-end mb-5">
                        <div className="fs-5 text-secondary mb-2">
                            Total Due:
                        </div>
                        <h2 className="display-4 fw-light mb-0 lh-1">
                            ₱{Number(order.total || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })}
                        </h2>
                    </div>

                    {/* Table */}
                    <div className="table-responsive mb-5">
                        <table className="table table-bordered mb-0 align-middle">
                            <thead className="text-uppercase text-secondary fs-6" style={{ backgroundColor: '#efefef', letterSpacing: '1.5px' }}>
                                <tr>
                                    <th className="py-3 px-4 border-bottom-0" style={{ width: '58%' }}>Charges</th>
                                    <th className="text-center py-3 px-4 border-bottom-0" style={{ width: '18%' }}>Quantity</th>
                                    <th className="text-end py-3 px-4 border-bottom-0" style={{ width: '24%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.map((detail, index) => (
                                    <tr key={detail.id || index}>
                                        <td className="py-4 px-4 fs-5">
                                            {detail.product
                                                ? detail.product.product_name
                                                : 'Unknown Item'}
                                        </td>
                                        <td className="text-center py-4 px-4 fs-5">
                                            {detail.quantity}
                                        </td>
                                        <td className="text-end py-4 px-4 fs-5 fw-medium">
                                            ₱{Number(detail.total).toLocaleString(undefined, {
                                                minimumFractionDigits: 2
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="d-flex justify-content-end">
                        <div className="border p-4 w-100 rounded-1" style={{ maxWidth: '320px' }}>
                            <div className="border-top border-dark border-2 pt-3 d-flex justify-content-between align-items-center fs-4 fw-medium">
                                <span>Total</span>
                                <span>
                                    ₱{Number(order.total || 0).toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Failsafe Hardware Print Styles */}
            <style>
                {`
                    @media print {
                        @page {
                            margin: 0;
                            size: auto;
                        }
                        body, html {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .invoice-page-wrapper {
                            background: white !important;
                            padding: 0 !important;
                        }
                        .invoice-doc-wrapper {
                            max-width: 100% !important;
                            width: 100% !important;
                            box-shadow: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

InvoiceReceipt.layout = page => <CustomerLayout children={page} />;

export default InvoiceReceipt;