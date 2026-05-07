import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layout/AdminLayout';

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

    // Calculate dynamic date range string (e.g. 05-01-to-05-07)
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
            return `${mm}-${dd}`;
        };

        return `${formatDate(start)}-to-${formatDate(end)}`;
    };

    // PDF Generator via Browser Print Engine
    const generatePDF = (periodStr) => {
        const periodName = periodStr === 'monthly' ? 'Monthly' : 'Weekly';
        const dateRange = getDateRangeString(periodName);
        const fileName = `FlowerShop${periodName}_${dateRange}`;

        // Create a temporary print window
        const printWindow = window.open('', '_blank');
        
        // Inject clean, printable HTML layout
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
                    body { 
                        font-family: 'Poppins', sans-serif; 
                        padding: 40px; 
                        color: #1E1E1E; 
                        background-color: #fff;
                    }
                    .header {
                        border-bottom: 2px solid #1F2D5A;
                        padding-bottom: 10px;
                        margin-bottom: 30px;
                    }
                    h1 { color: #1F2D5A; margin: 0; font-size: 24px; }
                    .date-range { color: #6c757d; font-size: 14px; margin-top: 5px; }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 15px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #F5F4FF; 
                        color: #1F2D5A;
                        font-weight: 600;
                    }
                    .amount { font-weight: bold; }
                    .footer {
                        margin-top: 50px;
                        font-size: 12px;
                        color: #aaa;
                        text-align: center;
                    }
                    @media print {
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Tungal Flower Shop - ${periodName} Sales Report</h1>
                    <div class="date-range">Report Period: ${dateRange.replace(/-/g, '/').replace('/to/', ' to ')}</div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Metric Overview</th>
                            <th>Total Value</th>
                            <th>Performance Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Generated Sales</td>
                            <td class="amount">PHP ${salesOverview.totalSales || '0'}</td>
                            <td>${salesOverview.salesTrend || '0%'}</td>
                        </tr>
                        <tr>
                            <td>Total Processed Orders</td>
                            <td class="amount">${salesOverview.totalOrders || '0'} Orders</td>
                            <td>${salesOverview.ordersTrend || '0%'}</td>
                        </tr>
                        <tr>
                            <td>Average Sale per Order</td>
                            <td class="amount">PHP ${salesOverview.avgSales || '0'}</td>
                            <td>${salesOverview.avgTrend || '0%'}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    Generated automatically by Tungal Flower Shop System.
                </div>

                <script>
                    window.onload = () => {
                        window.print();
                        setTimeout(() => { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
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

            {/* Inventory Report Modal - Cleaned up to strictly show actual products */}
            {isInventoryModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h4 className="modal-title fw-bold" style={{ color: '#7978E9' }}>
                                    <ReportIcon /> Current Inventory
                                </h4>
                                <button type="button" className="btn-close m-0" onClick={() => setIsInventoryModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-secondary text-uppercase" style={{ fontSize: '0.85rem', width: '20%' }}>Product ID</th>
                                                <th className="text-secondary text-uppercase" style={{ fontSize: '0.85rem' }}>Product Name</th>
                                                <th className="text-secondary text-uppercase text-center" style={{ fontSize: '0.85rem', width: '25%' }}>Current Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allProducts && allProducts.length > 0 ? allProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td className="text-muted fw-semibold">#{product.id.toString().padStart(4, '0')}</td>
                                                    <td className="fw-bold" style={{ color: '#1E1E1E' }}>{product.product_name}</td>
                                                    <td className="text-center fw-bold fs-5">{product.stocks}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-5 text-muted fw-bold">No inventory products found in the database.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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