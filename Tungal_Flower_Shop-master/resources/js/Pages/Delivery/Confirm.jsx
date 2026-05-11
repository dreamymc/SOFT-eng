import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import DeliveryLayout from '../../Layout/DeliveryLayout';

function Confirm({ order }) {
    const { data, setData, post, processing, errors } = useForm({
        proof_image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('delivery.confirm.store', order.id));
    };

    return (
        <div className="container py-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Head title="Confirm Delivery" />
            
            <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header text-white text-center py-3 position-relative border-0" style={{ backgroundColor: '#1E1E1E' }}>
                    <Link href={route('delivery.details', order.id)} className="btn btn-sm btn-light position-absolute fw-bold" style={{ left: '15px', top: '15px', borderRadius: '6px' }}>Back</Link>
                    <h5 className="mb-0 mt-1 fw-bold">Delivery Proof</h5>
                    <small className="opacity-75">Order #TUNGAL{order.id}</small>
                </div>
                
                <div className="card-body p-4 p-md-5">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5 text-center">
                            <div className="mb-3 d-flex justify-content-center">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', color: '#6C63FF' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <label className="form-label fw-bolder fs-5 text-dark">Upload Photo of Delivery</label>
                            <p className="text-muted small px-3">Take a clear photo of the items at the exact delivery location to confirm a successful drop-off.</p>
                            
                            <input 
                                type="file" 
                                className="form-control form-control-lg mt-4 shadow-none" 
                                style={{ border: '2px dashed #DEE2E6', borderRadius: '10px', backgroundColor: '#F8F9FA' }}
                                onChange={e => setData('proof_image', e.target.files[0])}
                                accept="image/*"
                                capture="environment" 
                            />
                            {errors.proof_image && (
                                <div className="text-danger mt-2 fw-bold bg-danger-subtle p-2 rounded">{errors.proof_image}</div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="btn w-100 py-3 fs-5 fw-bold shadow-sm text-white" 
                            style={{ backgroundColor: '#28A745', borderRadius: '10px' }}
                            disabled={processing || !data.proof_image}
                        >
                            {processing ? 'Uploading Proof...' : 'Confirm Delivery'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Forces the page to use the Delivery Sidebar instead of the Customer default
Confirm.layout = page => <DeliveryLayout children={page} />;
export default Confirm;