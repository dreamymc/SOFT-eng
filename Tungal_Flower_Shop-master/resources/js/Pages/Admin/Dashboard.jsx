import React from 'react'
import { BsBoxSeam } from "react-icons/bs";
import { HiOutlinePencil } from "react-icons/hi2";
import SalesChart from '../../Layout/SalesChart';
import AdminLayout from '../../Layout/AdminLayout'

function Dashboard({ 
    total_flowers_in_store, 
    recent_orders_count, 
    chartData, 
    topSellingProducts, 
    leastSellingProducts, 
    low_stock_count, 
    total_categories, 
    recently_added, 
    returned_flowers 
}) {
    
    // Arrays preserving your exact design colors for the dynamic mapping
    const topColors = ['#8ea9f9', '#a1c1ff', '#d0d4ef'];
    const leastColors = ['#ef7d84', '#f6a9ae', '#fbd1d6'];

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
            </div>

            {/* Middle Row Charts & Stats */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-7">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold" style={{ color: '#6d78e3' }}>Sales Summary <span className="text-muted fw-normal fs-6">(last 30 days)</span></h5>
                            <div className="mt-4" style={{ height: '250px' }}>
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
                                <span className="fw-bold" style={{ color: '#de5b62' }}>Low Stock Flower Categories</span>
                                <span className="fw-bold" style={{ color: '#de5b62' }}>{low_stock_count || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <span className="text-secondary fw-semibold">Flower Categories</span>
                                <span className="fw-bold text-dark">{total_categories || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <span className="text-secondary fw-semibold">Recently added amount</span>
                                <span className="fw-bold text-dark">{recently_added || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <span className="fw-bold" style={{ color: '#db8435' }}>Returned/Damaged Flowers</span>
                                <span className="fw-bold" style={{ color: '#db8435' }}>{returned_flowers || 0}</span>
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
        </div>
    )
}

Dashboard.layout = page => <AdminLayout children={page} />
export default Dashboard