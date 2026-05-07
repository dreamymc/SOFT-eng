import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layout/AdminLayout';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AlertCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const ReportIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const TrendUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

function Report({ allProducts = [], stockAlerts = [], salesOverview = {} }) {
    
    // State for managing modals
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

    const getAlertStyle = (type) => {
        switch(type) {
            case 'below_minimum':
                return { bg: '#FFFFFF', text: '#D84B51', mutedText: '#6c757d', badge: 'danger' };
            case 'attention':
                return { bg: '#D98014', text: '#FFFFFF', mutedText: '#FFFFFF', badge: 'warning' };
            case 'low_stock':
                return { bg: '#FFFFFF', text: '#D98014', mutedText: '#6c757d', badge: 'warning' };
            case 'out_of_stock':
                return { bg: '#B21F1F', text: '#FFFFFF', mutedText: '#FFFFFF', badge: 'dark' };
            default:
                return { bg: '#FFFFFF', text: '#1E1E1E', mutedText: '#6c757d', badge: 'secondary' };
        }
    };

    // Calculate dynamic date range string (e.g. 05/01-05/07)
    const getDateRangeString = (period) => {
        const end = new Date();
        const start = new Date();
        
        if (period === 'Weekly') {
            start.setDate(end.getDate() - 7);
        } else if (period === 'Monthly') {
            start.setDate(end.getDate() - 30);
        }

        const formatDate = (date) => {
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${mm}/${dd}`;
        };

        return `${formatDate(start)}-${formatDate(end)}`;
    };

    // Native Silent PDF Generator using jsPDF
    const generatePDF = (periodStr) => {
        try {
            const periodName = periodStr === 'monthly' ? 'Monthly' : 'Weekly';
            const dateRange = getDateRangeString(periodName);
            const fileName = `FlowerShop${periodName}_${dateRange.replace(/\//g, '')}.pdf`;

            const doc = new jsPDF();

            // Add Header
            doc.setFontSize(22);
            doc.setTextColor(31, 45, 90); // #1F2D5A
            doc.text(`Tungal Flower Shop - ${periodName} Report`, 14, 22);
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Report Period: ${dateRange}`, 14, 30);

            // Add Data Table
            doc.autoTable({
                startY: 40,
                headStyles: { fillColor: [121, 120, 233] }, // #7978E9
                head: [['Metric Overview', 'Total Value', 'Performance Trend']],
                body: [
                    ['Total Generated Sales', `PHP ${salesOverview.totalSales || '0'}`, salesOverview.salesTrend || '0%'],
                    ['Total Processed Orders', `${salesOverview.totalOrders || '0'} Orders`, salesOverview.ordersTrend || '0%'],
                    ['Average Sale per Order', `PHP ${salesOverview.avgSales || '0'}`, salesOverview.avgTrend || '0%'],
                ],
                theme: 'grid',
                styles: { fontSize: 11, cellPadding: 6 }
            });

            // Add Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('Generated automatically by Tungal Flower Shop System.', 14, pageHeight - 10);

            // Download silently
            doc.save(fileName);

        } catch (error) {
            console.error("PDF Generation failed: ", error);
            alert("Failed to generate PDF. Make sure you restart your terminal (npm run dev) so the new packages load.");
        }
    };

    return (
        <div className="container-fluid py-5 px-4 position-relative" style={{ minHeight: '100vh', backgroundColor: '#F5F4FF', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Reports" />

            {/* header Row */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold m-0" style={{ color: '#1E1E1E', fontSize: '2.5rem' }}>Reports</h1>
                
                <button onClick={() => setIsInventoryModalOpen(true)} className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm px-4" style={{ backgroundColor: '#7978E9', borderRadius: '10px', height: '50px', border: 'none' }}>
                    <ReportIcon /> Inventory Report
                </button>
            </div>

            {/* SECTION 1: Critical Stock Alerts */}
            <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '15px', backgroundColor: '#FCE8E8' }}>
                <div className="card-body p-4 p-lg-5">
                    
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2" style={{ color: '#D84B51' }}>
                            <AlertCircleIcon />
                            <h4 className="fw-bold m-0">Critical Stock Alerts</h4>
                        </div>
                        <button onClick={() => setIsAlertModalOpen(true)} className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm px-4" style={{ backgroundColor: '#D84B51', borderRadius: '10px', height: '45px', border: 'none' }}>
                            <ReportIcon /> Alert Report
                        </button>
                    </div>

                    <div className="row g-4">
                        {stockAlerts.length > 0 ? (
                            stockAlerts.map((alert) => {
                                const style = getAlertStyle(alert.type);
                                return (
                                    <div className="col-12 col-md-6 col-xl-3" key={alert.id}>
                                        <div className="card h-100 border-0 shadow-sm text-center" style={{ backgroundColor: style.bg, borderRadius: '12px' }}>
                                            <div className="card-body d-flex flex-column justify-content-center p-4">
                                                <p className="fw-semibold mb-2" style={{ color: style.text, fontSize: '0.9rem' }}>
                                                    {alert.label} {alert.type === 'attention' && <AlertCircleIcon />}
                                                </p>
                                                <h3 className="fw-bold mb-3" style={{ color: style.text }}>{alert.product}</h3>
                                                <h5 className="fw-bold mb-4" style={{ color: style.text }}>
                                                    {alert.units < 10 && alert.units > 0 ? `0${alert.units}` : alert.units === 0 ? '00' : alert.units} Units
                                                </h5>
                                                <div className="d-flex align-items-center justify-content-center gap-2 mt-auto" style={{ color: style.mutedText, fontSize: '0.8rem' }}>
                                                    <ClockIcon />
                                                    <span>{alert.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-12 text-center py-4">
                                <p className="text-muted fw-bold mb-0">Inventory levels are healthy. No critical alerts.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* SECTION 2: Sales & Customers Overview */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#FFFFFF' }}>
                <div className="card-body p-4 p-lg-5">
                    
                    <h4 className="fw-bold mb-5" style={{ color: '#7DA0FA' }}>Sales & Customers Overview</h4>

                    <div className="row g-4 justify-content-center mb-5">
                        
                        {/* Total Sales */}
                        <div className="col-12 col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center" style={{ backgroundColor: '#1F2D5A', borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <p className="text-white-50 fw-semibold mb-3">Total Sales</p>
                                    <h2 className="fw-bold text-white mb-4">₱ {salesOverview.totalSales || '0'}</h2>
                                    <div className="d-flex align-items-center justify-content-center gap-2 fw-semibold" style={{ color: '#00D2FF' }}>
                                        <TrendUpIcon />
                                        <span>{salesOverview.salesTrend || '0%'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Orders */}
                        <div className="col-12 col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center" style={{ backgroundColor: '#1F2D5A', borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <p className="text-white-50 fw-semibold mb-3">Total Orders</p>
                                    <h2 className="fw-bold text-white mb-4">{salesOverview.totalOrders || '0'}</h2>
                                    <div className="d-flex align-items-center justify-content-center gap-2 fw-semibold" style={{ color: '#00D2FF' }}>
                                        <TrendUpIcon />
                                        <span>{salesOverview.ordersTrend || '0%'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Average Sales */}
                        <div className="col-12 col-md-4">
                            <div className="card h-100 border-0 shadow-sm text-center" style={{ backgroundColor: '#1F2D5A', borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <p className="text-white-50 fw-semibold mb-3">Average Sales</p>
                                    <h2 className="fw-bold text-white mb-4">₱ {salesOverview.avgSales || '0'}</h2>
                                    <div className="d-flex align-items-center justify-content-center gap-2 fw-semibold" style={{ color: '#00D2FF' }}>
                                        <TrendUpIcon />
                                        <span>{salesOverview.avgTrend || '0%'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Download buttons */}
                    <div className="d-flex justify-content-center gap-4">
                        <button onClick={() => generatePDF('monthly')} className="btn d-flex flex-column align-items-center justify-content-center fw-bold shadow-sm" style={{ backgroundColor: '#9CB4FA', color: '#1E1E1E', borderRadius: '10px', width: '220px', height: '80px', border: 'none' }}>
                            <span>Download</span>
                            <span>Monthly PDF Report</span>
                            <DownloadIcon />
                        </button>
                        
                        <button onClick={() => generatePDF('weekly')} className="btn d-flex flex-column align-items-center justify-content-center fw-bold shadow-sm" style={{ backgroundColor: '#9CB4FA', color: '#1E1E1E', borderRadius: '10px', width: '220px', height: '80px', border: 'none' }}>
                            <span>Download</span>
                            <span>Weekly PDF Report</span>
                            <DownloadIcon />
                        </button>
                    </div>

                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* Alert Report Modal */}
            {isAlertModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                                <h4 className="modal-title fw-bold" style={{ color: '#D84B51' }}>
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
                                                <th className="text-secondary text-end">Last Updated</th>
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

            {/* Simplified Inventory Report Modal (Next Expiring Batch only) */}
            {isInventoryModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="modal-title fw-bold m-0" style={{ color: '#7978E9' }}>
                                        <ReportIcon /> Current Master Inventory
                                    </h4>
                                    <p className="text-muted small mt-1 mb-0">Overview of available stock, sales, and the next expiring batch.</p>
                                </div>
                                <button type="button" className="btn-close m-0" onClick={() => setIsInventoryModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                
                                {allProducts && allProducts.length > 0 ? allProducts.map(product => {
                                    
                                    // Because the controller already uses orderBy('expires_at', 'asc'),
                                    // the very first active batch in this array is the closest to expiration.
                                    const nextBatch = product.batches && product.batches.length > 0 ? product.batches[0] : null;

                                    return (
                                        <div key={product.id} className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <div className="card-body p-4">
                                                <div className="row align-items-center">
                                                    
                                                    {/* Flower Image & Title */}
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

                                                    {/* Overview Stats */}
                                                    <div className="col-12 col-md-8">
                                                        <div className="row text-center">
                                                            <div className="col-4 border-end">
                                                                <p className="text-muted mb-1 small fw-semibold text-uppercase">Total In Stock</p>
                                                                <h4 className={`fw-bold m-0 ${product.stocks <= 10 ? 'text-danger' : 'text-success'}`}>{product.stocks}</h4>
                                                            </div>
                                                            <div className="col-4 border-end">
                                                                <p className="text-muted mb-1 small fw-semibold text-uppercase">Total Sold</p>
                                                                <h4 className="fw-bold m-0" style={{ color: '#7978E9' }}>{product.order_details_sum_quantity || 0}</h4>
                                                            </div>
                                                            <div className="col-4">
                                                                <p className="text-muted mb-1 small fw-semibold text-uppercase">Next Expiration</p>
                                                                {nextBatch ? (
                                                                    <>
                                                                        <h5 className="fw-bold m-0 text-danger">
                                                                            {new Date(nextBatch.expires_at).toLocaleDateString()}
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

        </div>
    );
}

Report.layout = page => <AdminLayout children={page} />;
export default Report;