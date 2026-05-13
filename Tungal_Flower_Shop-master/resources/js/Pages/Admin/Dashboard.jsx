import React, { useState } from 'react'
import { BsBarChartFill, BsBoxSeam, BsFileText } from "react-icons/bs";
import { HiOutlinePencil } from "react-icons/hi2";
import SalesChart from '../../Layout/SalesChart';
import AdminLayout from '../../Layout/AdminLayout'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmModal from '../../Components/ConfirmModal';

const AlertCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const DownloadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

function Dashboard({ 
    total_flowers_in_store, 
    recent_orders_count, 
    chartData, 
    topSellingProducts, 
    leastSellingProducts, 
    low_stock_count, 
    total_categories, 
    recently_added, 
    returned_flowers,
    total_pieces_sold,
    out_of_stock_count,
    active_batch_count,
    expiring_soon_count,
    allProducts = [],
    stockAlerts = [],
    salesReportOrders = []
}) {
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [pdfError, setPdfError] = useState('');
    
    // Arrays preserving your exact design colors for the dynamic mapping
    const topColors = ['#8ea9f9', '#a1c1ff', '#d0d4ef'];
    const leastColors = ['#ef7d84', '#f6a9ae', '#fbd1d6'];

    const getAlertStyle = (type) => {
        switch(type) {
            case 'below_minimum':
                return { badge: 'danger' };
            case 'attention':
                return { badge: 'warning' };
            case 'low_stock':
                return { badge: 'warning' };
            case 'out_of_stock':
                return { badge: 'dark' };
            default:
                return { badge: 'secondary' };
        }
    };

    const getPeriodOrders = (period) => {
        const now = new Date();
        let startDate = null;

        if (period === 'weekly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'monthly') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
        } else if (period === 'yearly') {
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
        }

        return startDate
            ? salesReportOrders.filter(order => new Date(order.created_at) >= startDate)
            : salesReportOrders;
    };

    const getPeriodLabel = (period) => {
        const labels = {
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly',
            all: 'All Time'
        };

        return labels[period] || 'Sales';
    };

    const getOrderStatus = (order) => {
        const status = order.order_status || order.status || 'N/A';
        return status === 'Approved' ? 'Refunded' : status;
    };

    const generateSalesPDF = (period) => {
        try {
            const periodLabel = getPeriodLabel(period);
            const orders = getPeriodOrders(period);
            const doc = new jsPDF('landscape');

            doc.setFontSize(18);
            doc.setTextColor(31, 30, 30);
            doc.text(`Tungal Flower Shop - ${periodLabel} Sales Report`, 14, 18);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

            autoTable(doc, {
                startY: 34,
                head: [[
                    'Order ID',
                    'Handled By',
                    'Order Qty',
                    'Total Pieces',
                    'Source Batches',
                    'Total Amount',
                    'Date',
                    'Status'
                ]],
                body: orders.map(order => {
                    const totalPiecesBought = order.details
                        ? order.details.reduce((sum, detail) => sum + (parseInt(detail.quantity) * parseInt(detail.multiplier)), 0)
                        : 0;

                    const allUsedBatches = order.details
                        ? [...new Set(order.details.flatMap(detail => detail.batch_ids ? detail.batch_ids.split(', ') : []))].join(', ')
                        : 'N/A';

                    const handledBy = order.user ? `${order.user.firstname} ${order.user.lastname}` : 'System';
                    const formattedDate = new Date(order.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    });

                    return [
                        `#TUNGAL${order.id}`,
                        handledBy,
                        `${order.quantity} Units`,
                        `${totalPiecesBought} Pieces`,
                        allUsedBatches || 'N/A',
                        `PHP ${order.total}`,
                        formattedDate,
                        getOrderStatus(order)
                    ];
                }),
                theme: 'grid',
                headStyles: { fillColor: [248, 249, 250], textColor: [30, 30, 30], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 28 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 28 },
                    4: { cellWidth: 42 },
                    5: { cellWidth: 28 },
                    6: { cellWidth: 38 },
                    7: { cellWidth: 34 },
                },
            });

            doc.save(`Tungal_${periodLabel.replace(/\s+/g, '_')}_Sales_Report.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            setPdfError(`Failed to generate PDF. Error: ${error.message}`);
        }
    };

    return (
        <div className="container-fluid p-0">
            <h2 className="fw-bold mb-4" style={{ color: '#1a1d2d' }}>Dashboard</h2>

            {/* Top Metric Cards */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 text-white h-100" style={{ backgroundColor: '#5873d1', borderRadius: '12px' }}>
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-1" style={{ fontSize: '0.95rem' }}>Total Flowers in Store</p>
                                <h1 className="fw-bold mb-0 display-5">{total_flowers_in_store || 0}</h1>
                            </div>
                            <BsBoxSeam style={{ fontSize: '2.5rem', opacity: '0.9' }} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 text-white h-100" style={{ backgroundColor: '#707584', borderRadius: '12px' }}>
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-1" style={{ fontSize: '0.95rem' }}>Total Flowers Orders</p>
                                <h1 className="fw-bold mb-0 display-5 d-inline-block me-2">{recent_orders_count || 0}</h1>
                                <span style={{ fontSize: '0.8rem', opacity: '0.8' }}>(last 30 days)</span>
                            </div>
                            <HiOutlinePencil style={{ fontSize: '2rem', opacity: '0.9' }} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 text-white h-100" style={{ backgroundColor: '#2f9e77', borderRadius: '12px' }}>
                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-1" style={{ fontSize: '0.95rem' }}>Total Flower Pieces Sold</p>
                                <h1 className="fw-bold mb-0 display-5">{Number(total_pieces_sold || 0).toLocaleString('en-US')}</h1>
                            </div>
                            <BsBarChartFill style={{ fontSize: '2.3rem', opacity: '0.9' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Actions */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                        <h5 className="fw-bold mb-0" style={{ color: '#6d78e3' }}>Reports</h5>
                        <div className="d-flex flex-wrap gap-2">
                            <button onClick={() => setIsInventoryModalOpen(true)} className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm px-3" style={{ backgroundColor: '#7978E9', borderRadius: '10px', height: '42px', border: 'none' }}>
                                <BsFileText /> Inventory Report
                            </button>
                            <button onClick={() => setIsAlertModalOpen(true)} className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm px-3" style={{ backgroundColor: '#D84B51', borderRadius: '10px', height: '42px', border: 'none' }}>
                                <AlertCircleIcon /> Alert Report
                            </button>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap gap-3">
                        {['weekly', 'monthly', 'yearly', 'all'].map(period => (
                            <button key={period} onClick={() => generateSalesPDF(period)} className="btn d-flex align-items-center justify-content-center gap-2 fw-bold shadow-sm" style={{ backgroundColor: '#9CB4FA', color: '#1E1E1E', borderRadius: '10px', minWidth: '190px', height: '48px', border: 'none' }}>
                                <DownloadIcon />
                                {getPeriodLabel(period)} PDF Report
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle Row Charts & Stats */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-7">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-2" style={{ color: '#6d78e3' }}>Sales Summary <span className="text-muted fw-normal fs-6">(last 30 days)</span></h5>
                            <div style={{ height: '280px' }}>
                                {/* Feeds the larger dataset to your chart */}
                                <SalesChart topSellingProducts={chartData || []} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-5">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold text-center mb-4" style={{ color: '#6d78e3' }}>Stock Numbers</h5>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <span className="fw-bold" style={{ color: '#2f9e77' }}>Active Batch Count</span>
                                <span className="fw-bold" style={{ color: '#2f9e77' }}>{active_batch_count || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <span className="text-secondary fw-semibold">Low Stock Categories</span>
                                <span className="fw-bold text-dark">{low_stock_count || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <span className="text-secondary fw-semibold">Out of Stock Categories</span>
                                <span className="fw-bold text-dark">{out_of_stock_count || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <span className="fw-bold" style={{ color: '#db8435' }}>Expiring Within 7 Days</span>
                                <span className="fw-bold" style={{ color: '#db8435' }}>{expiring_soon_count || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-secondary fw-semibold">Total Product Categories</span>
                                <span className="fw-bold text-dark">{total_categories || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row Best/Least Sellers */}
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4 d-flex flex-column">
                            <h5 className="fw-bold mb-4" style={{ color: '#6d78e3' }}>Top Selling Flowers <span className="text-muted fw-normal fs-6">(last 30 days)</span></h5>
                            <div className="row flex-grow-1 text-center g-3">
                                {topSellingProducts && topSellingProducts.length > 0 ? (
                                    topSellingProducts.map((item, index) => (
                                        <div className="col-4" key={index}>
                                            <div className="p-3 rounded h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: topColors[index] || '#d0d4ef' }}>
                                                <p className="fw-bold text-dark mb-2 text-truncate" style={{ maxWidth: '100%' }}>{item.product?.product_name || 'Unknown'}</p>
                                                <h4 className="fw-bold text-dark mb-0">₱{Number(item.total_sales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 d-flex align-items-center justify-content-center">
                                        <p className="text-muted mb-0">No sales data available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4 d-flex flex-column">
                            <h5 className="fw-bold mb-4" style={{ color: '#de5b62' }}>Least Selling Flowers <span className="text-muted fw-normal fs-6">(last 30 days)</span></h5>
                            <div className="row flex-grow-1 text-center g-3">
                                {leastSellingProducts && leastSellingProducts.length > 0 ? (
                                    leastSellingProducts.map((item, index) => (
                                        <div className="col-4" key={index}>
                                            <div className="p-3 rounded h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: leastColors[index] || '#fbd1d6' }}>
                                                <p className="fw-bold text-dark mb-2 text-truncate" style={{ maxWidth: '100%' }}>{item.product?.product_name || 'Unknown'}</p>
                                                <h4 className="fw-bold text-dark mb-0">₱{Number(item.total_sales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 d-flex align-items-center justify-content-center">
                                        <p className="text-muted mb-0">No sales data available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Report Modal */}
            {isAlertModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                                <h4 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ color: '#D84B51' }}>
                                    <AlertCircleIcon /> Critical Alerts List
                                </h4>
                                <button type="button" className="btn-close" onClick={() => setIsAlertModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-secondary">Product Name</th>
                                                <th className="text-secondary text-center">Current Stock</th>
                                                <th className="text-secondary text-center">Status</th>
                                                <th className="text-secondary text-end">Alert Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockAlerts.length > 0 ? stockAlerts.map(alert => {
                                                const style = getAlertStyle(alert.type);
                                                return (
                                                    <tr key={alert.id}>
                                                        <td className="fw-bold" style={{ color: '#1E1E1E' }}>{alert.product}</td>
                                                        <td className="text-center fw-semibold">{alert.units}</td>
                                                        <td className="text-center">
                                                            <span className={`badge bg-${style.badge} px-3 py-2 rounded-pill`}>
                                                                {alert.label}
                                                            </span>
                                                        </td>
                                                        <td className="text-end text-muted small">{alert.date}</td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-muted fw-bold">No critical alerts to display.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                                <button type="button" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#D84B51', borderRadius: '8px' }} onClick={() => setIsAlertModalOpen(false)}>
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Inventory Report Modal */}
            {isInventoryModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="modal-title fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#7978E9' }}>
                                        <BsFileText /> Current Master Inventory
                                    </h4>
                                    <p className="text-muted small mt-1 mb-0">Overview of available stock, sales, and the next expiring batch.</p>
                                </div>
                                <button type="button" className="btn-close m-0" onClick={() => setIsInventoryModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                {allProducts && allProducts.length > 0 ? allProducts.map(product => {
                                    const nextBatch = product.batches && product.batches.length > 0 ? product.batches[0] : null;

                                    return (
                                        <div key={product.id} className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <div className="card-body p-4">
                                                <div className="row align-items-center">
                                                    <div className="col-12 col-md-4 d-flex align-items-center gap-3 mb-3 mb-md-0">
                                                        <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8f9fa', flexShrink: 0 }}>
                                                            {product.image ? (
                                                                <img src={`/storage/${product.image}`} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">No Img</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h5 className="fw-bold mb-1" style={{ color: '#1E1E1E' }}>{product.product_name}</h5>
                                                            <span className="badge bg-light text-secondary border">ID: #{product.id.toString().padStart(4, '0')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="col-12 col-md-8">
                                                        <div className="row text-center">
                                                            <div className="col-4 border-end">
                                                                <p className="text-muted mb-1 small fw-semibold text-uppercase">Total In Stock</p>
                                                                <h4 className={`fw-bold m-0 ${product.stocks <= 10 ? 'text-danger' : 'text-success'}`}>{product.stocks}</h4>
                                                            </div>
                                                            <div className="col-4 border-end">
                                                                <p className="text-muted mb-1 small fw-semibold text-uppercase">Total Pieces Sold</p>
                                                                <h4 className="fw-bold m-0" style={{ color: '#7978E9' }}>{product.total_pieces_sold || 0}</h4>
                                                            </div>
                                                            <div className="col-4">
                                                                <p className="text-muted mb-1 small fw-semibold text-uppercase">Next Expiration</p>
                                                                {nextBatch ? (
                                                                    <>
                                                                        <h5 className={`fw-bold m-0 ${nextBatch.expires_at ? 'text-danger' : 'text-muted'}`}>
                                                                            {nextBatch.expires_at ? new Date(nextBatch.expires_at).toLocaleDateString() : 'N/A'}
                                                                        </h5>
                                                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                            Batch #{nextBatch.batch_id || nextBatch.id} ({nextBatch.quantity} units)
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted small fw-bold">No Active Batches</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-5">
                                        <h5 className="text-muted fw-bold">No inventory products found in the database.</h5>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!pdfError}
                title="PDF Generation Failed"
                message={pdfError}
                confirmLabel="Close"
                variant="danger"
                hideCancel
                onConfirm={() => setPdfError('')}
            />
        </div>
    )
}

Dashboard.layout = page => <AdminLayout children={page} />
export default Dashboard
