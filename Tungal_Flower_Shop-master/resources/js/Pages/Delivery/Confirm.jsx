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
        <div className="container-fluid py-4 px-4 d-flex justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#F5F5FB', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Confirm Delivery" />

            <div style={{ width: '100%', maxWidth: '600px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Link href={route('delivery.details', order.id)} className="btn btn-light shadow-sm fw-bold d-flex align-items-center gap-2" style={{ borderRadius: '10px', color: '#1E1E1E' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back
                    </Link>
                    <h2 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '24px' }}>Delivery Proof</h2>
                </div>

                <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFF' }}>
                    <div className="card-header border-0 p-4" style={{ backgroundColor: '#7978E9' }}>
                        <h4 className="mb-0 fw-bold text-white text-center">#TUNGAL{order.id}</h4>
                    </div>

                    <div className="card-body p-4 p-md-5">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5 text-center">
                                <div className="mb-4 d-flex justify-content-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: '#F4F5FA', color: '#6C63FF' }}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <label className="form-label fw-bolder fs-5 text-dark mb-2">Upload Photo of Delivery</label>
                                <p className="text-muted small px-3 fw-medium">Take a clear photo of the items at the exact delivery location to confirm a successful drop-off.</p>

                                <div className="mt-4">
                                    <input
                                        type="file"
                                        className="form-control form-control-lg shadow-none"
                                        style={{ border: '2px dashed #7DA0FA', borderRadius: '12px', backgroundColor: '#F8F9FA', fontSize: '15px' }}
                                        onChange={e => setData('proof_image', e.target.files[0])}
                                        accept="image/*"
                                        capture="environment"
                                    />
                                </div>
                                {errors.proof_image && (
                                    <div className="text-danger mt-3 fw-bold bg-danger-subtle p-3 rounded-3" style={{ fontSize: '13px' }}>{errors.proof_image}</div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 py-3 fs-5 fw-bold shadow-sm text-white d-flex align-items-center justify-content-center gap-2"
                                style={{ backgroundColor: '#6C63FF', borderRadius: '12px' }}
                                disabled={processing || !data.proof_image}
                            >
                                {processing ? 'Uploading Proof...' : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Confirm Delivery
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

Confirm.layout = page => <DeliveryLayout children={page} />;
export default Confirm;