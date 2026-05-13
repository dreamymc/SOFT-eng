import React from 'react'
import logo from '../../../public/assets/images/logo.png'
import profile from '../../../public/assets/images/profile.png'
import { Link, usePage } from '@inertiajs/react'

export default function DeliveryLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            
            {/* Top Header (Logo Only) */}
            <nav className="shadow-sm px-4 py-3 bg-white" style={{ borderBottom: '1px solid #EBEAEE', zIndex: 10 }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded p-1" style={{ border: '1px solid #EBEAEE' }}>
                        <img src={logo} alt="logo" className="object-fit-cover" style={{ width: '40px', height: '40px' }} />
                    </div>
                    <div>
                        <h5 className="m-0 fw-bolder" style={{ color: '#1E1E1E', fontSize: '18px', letterSpacing: '-0.5px' }}>Tungal's Flower Shop</h5>
                        <small className="fw-bold" style={{ color: '#6C63FF', fontSize: '12px', letterSpacing: '1px' }}>DELIVERY PORTAL</small>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow-1 overflow-auto">
                {children}
            </main>

            {/* Bottom Bar (Profile & Logout pinned to Bottom Left) */}
            <footer className="bg-white shadow-sm mt-auto py-3 px-4 d-flex justify-content-start align-items-center gap-4" style={{ borderTop: '1px solid #EBEAEE', zIndex: 10 }}>
                
                {/* Driver Profile */}
                <div className="d-flex align-items-center gap-3">
                    <img 
                        src={auth?.user?.profile ? `/storage/${auth.user.profile}` : profile} 
                        alt="profile" 
                        className="object-fit-cover rounded-circle shadow-sm" 
                        style={{ width: '45px', height: '45px', border: '2px solid #6C63FF' }} 
                    />
                    <div>
                        <h6 className="m-0 fw-bold" style={{ color: '#1E1E1E', fontSize: '14px' }}>
                            {auth?.user ? `${auth.user.firstname} ${auth.user.lastname}` : 'Guest Driver'}
                        </h6>
                        <small className="text-muted fw-medium" style={{ fontSize: '12px' }}>Active Driver</small>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ height: '30px', width: '1px', backgroundColor: '#EBEAEE' }}></div>

                {/* Logout Button */}
                <Link
                    href={route('customer.index')}
                    className="btn btn-light d-flex align-items-center gap-2 fw-bold text-danger shadow-sm"
                    style={{ borderRadius: '8px', border: '1px solid #ffcccc', padding: '8px 16px' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Logout</span>
                </Link>

            </footer>

        </div>
    )
}