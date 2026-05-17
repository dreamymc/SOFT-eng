import React, { useEffect, useState, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useRoute } from '../../../../../vendor/tightenco/ziggy';
import { Toaster, toast } from 'sonner';

const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export default function AddEmployee({ isOpen, onClose }) {
    const route = useRoute();
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        profile: '',
        firstname: '',
        lastname: '',
        address: '',
        contact_number: '',
        username: '',
        role: 'Cashier',
        password: '', 
        hired_date: '',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('profile', file); 
        if (file) {
            setImagePreview(URL.createObjectURL(file)); 
        } else {
            setImagePreview(null); 
        }
    };

    function submit(e) {
        e.preventDefault();
        post(route('employee.storeEmployeeData'), {
            onSuccess: () => {
                reset();
                setData('profile', 'null');
                setImagePreview(null);
                onClose();
            }
        });
    }

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    if (!isOpen) return null;

    return (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
            style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050, padding: '15px' }}
        >
            <Toaster position="top-right" expand={true} richColors />

            <div 
                className="card shadow-lg border-0" 
                style={{ 
                    borderRadius: '16px', 
                    width: '100%', 
                    maxWidth: '550px',
                    backgroundColor: '#FFF'
                }}
            >
                <div className="card-body px-4 py-4">
                    <form onSubmit={submit}>

                        {/* IMAGE SECTION */}
                        <div className="text-center mb-3">
                            <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>Employee Image</h6>
                            <div 
                                className="d-flex flex-column justify-content-center align-items-center mx-auto"
                                style={{ 
                                    border: '2px dashed #DADDE1',
                                    backgroundColor: '#F8F9FA',
                                    borderRadius: '10px',
                                    height: '90px',
                                    maxWidth: '300px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                {imagePreview ? (
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="object-fit-cover rounded"
                                        style={{ height: '100%', width: '100%' }}
                                    />
                                ) : (
                                    <>
                                        <UploadIcon />
                                        <p className="text-muted mt-1 mb-0" style={{ fontSize: '12px' }}>Drag or Click to Upload</p>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="d-none" 
                                onChange={handleImageChange} 
                                accept="image/png, image/jpeg, image/jpg" 
                            />
                            {errors.profile && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{errors.profile}</div>}
                        </div>

                        {/* TITLE */}
                        <h4 className="fw-bold text-center mb-3">Add Employee</h4>

                        {/* FORM - Tightly packed */}
                        <div className="row g-2">
                            <div className="col-12">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>First Name</label>
                                <input type="text" className={`form-control form-control-sm ${errors.firstname ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} placeholder="e.g. John" value={data.firstname} onChange={(e) => setData('firstname', e.target.value)} />
                                {errors.firstname && <div className="invalid-feedback">{errors.firstname}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Last Name</label>
                                <input type="text" className={`form-control form-control-sm ${errors.lastname ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} placeholder="e.g. Doe" value={data.lastname} onChange={(e) => setData('lastname', e.target.value)} />
                                {errors.lastname && <div className="invalid-feedback">{errors.lastname}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Address</label>
                                <input type="text" className={`form-control form-control-sm ${errors.address ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} placeholder="Enter full address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Contact #</label>
                                <input type="text" className={`form-control form-control-sm ${errors.contact_number ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} placeholder="Enter contact number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} />
                                {errors.contact_number && <div className="invalid-feedback">{errors.contact_number}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Username</label>
                                <input type="text" className={`form-control form-control-sm ${errors.username ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} placeholder="Username" value={data.username} onChange={(e) => setData('username', e.target.value)} />
                                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Role</label>
                                <select className="form-select form-select-sm" style={{ borderRadius: '8px' }} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                                    <option>Admin</option>
                                    <option>Owner</option>
                                    <option>Manager</option>
                                    <option>Cashier</option>
                                    <option>Delivery</option>
                                </select>
                            </div>

                            {/* Grouping Password and Date side-by-side to save height */}
                            <div className="col-md-6">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Password</label>
                                <input type="password" className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} placeholder="Password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Hired Date</label>
                                <input type="date" className={`form-control form-control-sm ${errors.hired_date ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} value={data.hired_date} onChange={(e) => setData('hired_date', e.target.value)} />
                                {errors.hired_date && <div className="invalid-feedback">{errors.hired_date}</div>}
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <button type="button" onClick={onClose} className="btn btn-sm fw-bold text-white px-4" style={{ backgroundColor: '#DC3545', borderRadius: '8px', minWidth: '120px', padding: '8px' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="btn btn-sm fw-bold text-white px-4" style={{ backgroundColor: '#0D6EFD', borderRadius: '8px', minWidth: '120px', padding: '8px' }}>
                                {processing ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
