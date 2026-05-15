import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layout/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import profilePlaceholder from '../../../../public/assets/images/profile.png';
import AddEmployee from './Employee_Features/AddEmployee'; // <-- THIS IMPORT IS CRITICAL
import ConfirmModal from '../../Components/ConfirmModal';

const UserIconFilled = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const FireIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const ArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

function Employee({ employees }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [employeeToFire, setEmployeeToFire] = useState(null);
    const [isFireProcessing, setIsFireProcessing] = useState(false);
    
    const ITEMS_PER_PAGE = 4;
    const employeeList = employees?.data ? employees.data : employees || [];

    // Filter by search query
    const filteredEmployees = employeeList.filter((emp) => {
        const term = searchQuery.toLowerCase();
        const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase();
        return fullName.includes(term) || emp.role.toLowerCase().includes(term);
    });

    // Reset to page 1 whenever the search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleFire = (id) => {
        setEmployeeToFire(id);
    };

    const confirmFire = () => {
        if (!employeeToFire) return;

        setIsFireProcessing(true);
        router.delete(route('admin.employee.destroy', employeeToFire), {
            preserveScroll: true,
            onFinish: () => setIsFireProcessing(false),
            onSuccess: () => setEmployeeToFire(null)
        });
    };

    return (
        <div className="container-fluid py-5 px-5" style={{ minHeight: '100vh', backgroundColor: '#F4F5FA', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Employee" />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '32px' }}>Employee</h2>

                <div className="d-flex gap-4 align-items-center">
                    <div className="d-flex justify-content-center align-items-center rounded-pill px-4" style={{ backgroundColor: '#EBEAEE', width: '300px', height: '48px' }}>
                        <input
                            type="text"
                            className="form-control border-0 bg-transparent shadow-none text-center"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '14px', color: '#6c757d' }}
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn d-flex align-items-center gap-2 fw-semibold text-white px-4 rounded-4 shadow-sm border-0"
                        style={{ backgroundColor: '#7859FF', height: '48px', fontSize: '15px' }}
                    >
                        <UserIconFilled /> Add Employee
                    </button>
                </div>
            </div>

            {/* 2x2 Grid */}
            <div className="row row-cols-1 row-cols-md-2 g-5 mb-5">
                {displayedEmployees.length > 0 ? (
                    displayedEmployees.map((employee) => {
                        return (
                            <div className="col" key={employee.id}>
                                <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
                                    <div className="card-body p-4 d-flex align-items-center gap-4">
                                        
                                        <div 
                                            className="rounded-4 d-flex justify-content-center align-items-center overflow-hidden flex-shrink-0" 
                                            style={{ width: '120px', height: '120px', backgroundColor: '#7B9DFA' }}
                                        >
                                            <img
                                                src={employee.profile ? (employee.profile?.startsWith('http') ? employee.profile : `/storage/${employee.profile}`) : profilePlaceholder}
                                                alt="profile"
                                                className="object-fit-cover"
                                                style={{ width: '90%', height: '90%', borderRadius: '50%' }}
                                            />
                                        </div>

                                        <div className="d-flex flex-column justify-content-center w-100">
                                            <h4 className="fw-bold mb-2" style={{ color: '#7859FF' }}>
                                                {employee.firstname} {employee.lastname}
                                            </h4>
                                            
                                            <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: '16px' }}>
                                                {/* FIXED: Displaying the actual database ID instead of loop index */}
                                                <span className="fw-bold" style={{ color: '#5A637A' }}>
                                                    {String(employee.id).padStart(2, '0')}
                                                </span>
                                                <span style={{ color: '#7E869E' }}>{employee.role}</span>
                                            </div>

                                            <div className="d-flex align-items-center gap-3 mb-3" style={{ fontSize: '14px' }}>
                                                <span className="fw-bold" style={{ color: '#7E869E' }}>Hired Date</span>
                                                <span style={{ color: '#7E869E' }}>
                                                    {new Date(employee.created_at || '2025-05-05').toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center gap-4 mt-1">
                                                <Link
                                                    href={route('employee.viewProfile', { user_id: employee.id })}
                                                    className="d-flex align-items-center gap-2 fw-bold text-decoration-none"
                                                    style={{ color: '#7859FF', fontSize: '15px' }}
                                                >
                                                    <UserIconFilled /> View
                                                </Link>

                                                {/* FIXED: Added the Fire Button */}
                                                <button
                                                    onClick={() => handleFire(employee.id)}
                                                    className="btn btn-link d-flex align-items-center gap-1 fw-bold text-decoration-none p-0 m-0 shadow-none"
                                                    style={{ color: '#dc3545', fontSize: '15px' }}
                                                >
                                                    <FireIcon /> Fire
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted m-0">No employees found.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
                <div className="d-flex justify-content-end align-items-center gap-3 mt-5 pb-4">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`btn btn-link text-decoration-none d-flex align-items-center gap-2 fw-medium p-0 m-0 ${currentPage === 1 ? 'text-muted' : 'text-dark'}`}
                        style={{ fontSize: '14px', border: 'none', background: 'none' }}
                    >
                        <span style={{ color: currentPage === 1 ? '#C0C0C0' : '#A0A0A0' }}><ArrowLeft /></span> Previous
                    </button>
                    
                    <div className="d-flex gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            const isActive = pageNum === currentPage;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className="btn d-flex justify-content-center align-items-center rounded-2 fw-bold border-0 shadow-none"
                                    style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        backgroundColor: isActive ? '#7859FF' : 'transparent',
                                        color: isActive ? 'white' : '#7E869E'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`btn btn-link text-decoration-none d-flex align-items-center gap-2 fw-medium p-0 m-0 ${currentPage === totalPages ? 'text-muted' : 'text-dark'}`}
                        style={{ fontSize: '14px', border: 'none', background: 'none' }}
                    >
                        Next <span style={{ color: currentPage === totalPages ? '#C0C0C0' : '#A0A0A0' }}><ArrowRight /></span>
                    </button>
                </div>
            )}

            <AddEmployee 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />

            <ConfirmModal
                isOpen={!!employeeToFire}
                title="Fire Employee?"
                message="Are you sure you want to fire this employee? This action cannot be undone."
                confirmLabel="Fire"
                variant="danger"
                isProcessing={isFireProcessing}
                onCancel={() => setEmployeeToFire(null)}
                onConfirm={confirmFire}
            />
        </div>
    );
}

Employee.layout = page => <AdminLayout children={page} />;
export default Employee;
