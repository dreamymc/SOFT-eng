import React from 'react'
import logo from '../../../public/assets/images/logo.png'
import profile from '../../../public/assets/images/profile.png'
import { Link, usePage } from '@inertiajs/react'
import { BsFillGridFill, BsBoxSeam, BsFileText, BsTruck, BsArrowReturnLeft, BsCashStack, BsPersonCheck, BsCreditCard } from "react-icons/bs";
import { IoExit, IoPeople } from "react-icons/io5";
import { FaBars } from "react-icons/fa6";
import { useRoute } from '../../../vendor/tightenco/ziggy'
import MetaTagsLayout from './MetaTagsLayout';

export default function AdminLayout({ children }) {
    const route = useRoute();
    const { auth } = usePage().props;

    // Extract the role, fallback to Admin just in case
    const role = auth?.user?.role || 'Admin';

    const activeLinkStyle = { backgroundColor: '#6d78e3', color: 'white', fontWeight: 'bold' };
    const inactiveLinkStyle = { color: '#6c757d' };

    return (
        <>
            <MetaTagsLayout />
            <style>
                {`
                    .desktop-sidebar { width: 250px; position: fixed; height: 100vh; overflow-y: auto; }
                    .main-content { margin-left: 250px; min-height: 100vh; }
                    .sidebar-item-custom:hover { background-color: #f1f3f5; color: #000 !important; }
                    @media (max-width: 768px) {
                        .desktop-sidebar { display: none !important; }
                        .main-content { margin-left: 0; }
                    }
                `}
            </style>

            <div className="d-flex bg-light w-100" style={{ minHeight: '100vh' }}>
                
                {/* Desktop Sidebar */}
                <div className="bg-white shadow-sm p-4 d-flex flex-column align-items-center desktop-sidebar">
                    <h6 className='fw-bold mb-5 mt-2 text-center text-dark' style={{ letterSpacing: '0.5px' }}>TUNGAL'S FLOWER SHOP</h6>

                    <nav className="w-100 d-flex flex-column gap-2 mb-auto">
                        <Link href={route('admin.dashboard')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.dashboard') ? activeLinkStyle : inactiveLinkStyle}>
                            <BsFillGridFill className="fs-5" /> Dashboard
                        </Link>
                        
                        {(role === 'Admin' || role === 'Manager') && (
                            <Link href={route('admin.inventory')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.inventory') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsBoxSeam className="fs-5" /> Inventory
                            </Link>
                        )}

                        {(role === 'Admin' || role === 'Manager' || role === 'Owner') && (
                            <Link href={route('admin.sales')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.sales') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsCashStack className="fs-5" /> Sales
                            </Link>
                        )}
                        
                        {(role === 'Admin' || role === 'Owner') && (
                            <Link href={route('admin.report')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.report') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsFileText className="fs-5" /> Report
                            </Link>
                        )}
                        
                        {(role === 'Admin' || role === 'Manager') && (
                            <Link href={route('admin.returns')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.returns') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsArrowReturnLeft className="fs-5" /> Returns
                            </Link>
                        )}
                        
                        {(role === 'Admin' || role === 'Manager') && (
                            <Link href={route('admin.employee')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.employee') ? activeLinkStyle : inactiveLinkStyle}>
                                <IoPeople className="fs-5" /> Employee
                            </Link>
                        )}

                        {role === 'Admin' && (
                            <Link href={route('admin.payroll')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.payroll') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsCreditCard className="fs-5" /> Payroll
                            </Link>
                        )}
                        
                        {/* CHANGED: Approvals is now accessible by Admin OR Owner, properly linked */}
                        {(role === 'Owner' || role === 'Admin') && (
                            <Link href={route('admin.approvals')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.approvals') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsPersonCheck className="fs-5" /> Approvals
                            </Link>
                        )}
                    </nav>

                    <div className="d-flex flex-column align-items-center w-100 mt-4">
                        <img src={auth.user ? `/storage/${auth.user.profile}` : profile} alt="profile" className="rounded-circle mb-3 border" style={{ width: '90px', height: '90px', objectFit: 'cover' }} />
                        <h6 className="fw-bold text-dark text-center mb-4">{auth.user ? `${auth.user.firstname} ${auth.user.lastname}` : 'Juan Dela Cruz'}</h6>
                        <Link href={route('customer.index')} className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2 py-2" style={{ backgroundColor: '#de5b62', borderRadius: '8px' }}>
                            <IoExit className="fs-5" /> Log Out
                        </Link>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-light main-content w-100">
                    
                    {/* Mobile Top Navbar (Hidden on Desktop) */}
                    <nav className="d-flex justify-content-between align-items-center bg-white shadow-sm px-3 py-3 d-md-none sticky-top">
                        <div className="d-flex align-items-center gap-3">
                            <button className="btn btn-light" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample"><FaBars /></button>
                        </div>
                        <h6 className="mb-0 fw-bold">TUNGAL'S FLOWER SHOP</h6>
                    </nav>

                    {/* Dynamic Content Section */}
                    <section className="p-4" style={{ backgroundColor: '#f5f6fa', minHeight: '100vh' }}>
                        {children}
                    </section>
                </div>

                {/* Mobile Offcanvas Sidebar */}
                <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" style={{ width: '280px' }}>
                    <div className="offcanvas-header d-flex align-items-center bg-white border-bottom">
                        <h6 className="offcanvas-title fw-bold text-dark" id="offcanvasExampleLabel">TUNGAL'S FLOWER SHOP</h6>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body d-flex flex-column bg-white">
                        <nav className="d-flex flex-column gap-2 mb-auto">
                            <Link href={route('admin.dashboard')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none" style={route().current('admin.dashboard') ? activeLinkStyle : inactiveLinkStyle}>
                                <BsFillGridFill /> Dashboard
                            </Link>
                            
                            {(role === 'Admin' || role === 'Manager') && (
                                <Link href={route('admin.inventory')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none" style={route().current('admin.inventory') ? activeLinkStyle : inactiveLinkStyle}>
                                    <BsBoxSeam /> Inventory
                                </Link>
                            )}

                            {(role === 'Admin' || role === 'Manager' || role === 'Owner') && (
                                <Link href={route('admin.sales')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.sales') ? activeLinkStyle : inactiveLinkStyle}>
                                    <BsCashStack /> Sales
                                </Link>
                            )}
                            
                            {(role === 'Admin' || role === 'Owner') && (
                                <Link href={route('admin.report')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none" style={route().current('admin.report') ? activeLinkStyle : inactiveLinkStyle}>
                                    <BsFileText /> Report
                                </Link>
                            )}
                            
                            {(role === 'Admin' || role === 'Manager') && (
                                <Link href={route('admin.returns')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none" style={route().current('admin.returns') ? activeLinkStyle : inactiveLinkStyle}>
                                    <BsArrowReturnLeft /> Returns
                                </Link>
                            )}

                            {(role === 'Admin' || role === 'Manager') && (
                                <Link href={route('admin.employee')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none" style={route().current('admin.employee') ? activeLinkStyle : inactiveLinkStyle}>
                                    <IoPeople /> Employee
                                </Link>
                            )}

                            {role === 'Admin' && (
                                <Link href={route('admin.payroll')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none" style={route().current('admin.payroll') ? activeLinkStyle : inactiveLinkStyle}>
                                    <BsCreditCard /> Payroll
                                </Link>
                            )}

                            {/* CHANGED: Approvals is now accessible by Admin OR Owner, properly linked */}
                            {(role === 'Owner' || role === 'Admin') && (
                                <Link href={route('admin.approvals')} className="d-flex align-items-center gap-3 rounded p-3 text-decoration-none sidebar-item-custom" style={route().current('admin.approvals') ? activeLinkStyle : inactiveLinkStyle}>
                                    <BsPersonCheck className="fs-5" /> Approvals
                                </Link>
                            )}

                        </nav>

                        <div className="mt-4 pt-4 border-top d-flex flex-column align-items-center">
                            <img src={auth.user ? `/storage/${auth.user.profile}` : profile} alt="profile" className="rounded-circle mb-2" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                            <span className="fw-bold mb-3">{auth.user ? `${auth.user.firstname} ${auth.user.lastname}` : 'Guest'}</span>
                            <Link href={route('customer.index')} className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#de5b62', borderRadius: '8px' }}>
                                <IoExit /> Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
