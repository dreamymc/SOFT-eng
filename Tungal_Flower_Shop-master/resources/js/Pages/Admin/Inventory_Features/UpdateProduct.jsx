import React, { useEffect, useState, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';

const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export default function UpdateProduct({ isOpen, onClose, flower }) {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: '',
        image: '',
        product_name: '',       
        description: '',
        price: '', 
        types: [], 
    });

    useEffect(() => {
        if (flower && isOpen) {
            setData({
                id: flower.id,
                image: '', 
                product_name: flower.product_name || '',
                description: flower.description || '',
                price: flower.price || '',
                types: flower.types ? [...flower.types] : [], 
            });
            setImagePreview(flower.image ? (flower.image?.startsWith('http') ? flower.image : `/storage/${flower.image}`) : null);
            clearErrors();
        }
    }, [flower, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file); 
        if (file) {
            setImagePreview(URL.createObjectURL(file)); 
        } else {
            setImagePreview(flower?.image ? (flower.image?.startsWith('http') ? flower.image : `/storage/${flower.image}`) : null); 
        }
    };

    const addType = () => {
        setData('types', [...data.types, { name: '', multiplier: 1 }]);
    };

    const updateType = (index, field, value) => {
        const newTypes = [...data.types];
        newTypes[index][field] = value;
        setData('types', newTypes);
    };

    const removeType = (index) => {
        const newTypes = data.types.filter((_, i) => i !== index);
        setData('types', newTypes);
    };

    function submit(e) {
        e.preventDefault();
        post(route('inventory.updateProduct'), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            }
        });
    }

    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    if (!isOpen) return null;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050, padding: '15px' }}>
            <Toaster position="top-right" expand={true} richColors />

            <div className="card shadow-lg border-0" style={{ borderRadius: '16px', width: '100%', maxWidth: '550px', backgroundColor: '#FFF' }}>
                <div className="card-body px-4 py-4">
                    <form onSubmit={submit}>
                        
                        <div className="text-center mb-3">
                            <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>Flower Image</h6>
                            <div 
                                className="d-flex flex-column justify-content-center align-items-center mx-auto overflow-hidden"
                                style={{ border: '2px dashed #DADDE1', backgroundColor: '#F8F9FA', borderRadius: '10px', height: '120px', maxWidth: '300px', cursor: 'pointer' }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="object-fit-cover w-100 h-100" />
                                ) : (
                                    <>
                                        <UploadIcon />
                                        <p className="text-muted mt-1 mb-0" style={{ fontSize: '12px' }}>Drag or Click to Upload New Image</p>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="d-none" onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" />
                            {errors.image && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{errors.image}</div>}
                        </div>

                        <h4 className="fw-bold text-center mb-3">Update Flower Details</h4>

                        <div className="row g-2">
                            <div className="col-md-6">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Flower Name</label>
                                <input type="text" className={`form-control form-control-sm ${errors.product_name ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} value={data.product_name} onChange={(e) => setData('product_name', e.target.value)} />
                                {errors.product_name && <div className="invalid-feedback">{errors.product_name}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Price Per Piece (₱)</label>
                                <input type="number" className={`form-control form-control-sm ${errors.price ? 'is-invalid' : ''}`} style={{ borderRadius: '8px' }} value={data.price} onChange={(e) => setData('price', e.target.value)} />
                                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label text-muted mb-1" style={{ fontSize: '12px' }}>Description</label>
                                <textarea className={`form-control form-control-sm ${errors.description ? 'is-invalid' : ''}`} style={{ borderRadius: '8px', resize: 'none' }} rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)}></textarea>
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>

                            <div className="col-12 mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label text-muted fw-bold mb-0" style={{ fontSize: '12px' }}>Custom Quantifiers (Types)</label>
                                    <button type="button" onClick={addType} className="btn btn-sm text-white fw-bold" style={{ backgroundColor: '#7859FF', fontSize: '11px', borderRadius: '6px' }}>+ Add Type</button>
                                </div>
                                
                                {data.types.map((type, index) => (
                                    <div key={index} className="d-flex gap-2 mb-2">
                                        <input type="text" className="form-control form-control-sm shadow-none" style={{ borderRadius: '8px' }} placeholder="Type Name (e.g. Bouquet)" value={type.name} onChange={(e) => updateType(index, 'name', e.target.value)} required />
                                        <input type="number" className="form-control form-control-sm shadow-none" style={{ borderRadius: '8px', width: '100px' }} placeholder="Qty" value={type.multiplier} onChange={(e) => updateType(index, 'multiplier', e.target.value)} required min="1" />
                                        <button type="button" onClick={() => removeType(index)} className="btn btn-sm btn-light border-0 text-danger fw-bold" style={{ borderRadius: '8px' }}>X</button>
                                    </div>
                                ))}

                                {data.types.length === 0 && (
                                    <div className="text-muted text-center p-2" style={{ fontSize: '12px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                                        No custom types added. This flower will be sold as a single base unit.
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <button type="button" onClick={onClose} className="btn btn-sm fw-bold text-white px-4" style={{ backgroundColor: '#DC3545', borderRadius: '8px', minWidth: '120px', padding: '8px' }}>Cancel</button>
                            <button type="submit" disabled={processing} className="btn btn-sm fw-bold text-white px-4" style={{ backgroundColor: '#0D6EFD', borderRadius: '8px', minWidth: '120px', padding: '8px' }}>{processing ? 'Updating...' : 'Update'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}