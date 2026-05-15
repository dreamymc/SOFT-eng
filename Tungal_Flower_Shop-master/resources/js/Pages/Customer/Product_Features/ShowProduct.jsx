import React, { useState, useEffect } from 'react'
import CustomerLayout from '../../../Layout/CustomerLayout'
import { useRoute } from '../../../../../vendor/tightenco/ziggy'
import { Link, useForm, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { BsCartFill } from "react-icons/bs";

function ShowProduct({ product }) {
    const route = useRoute();
    const { flash } = usePage().props;

    // INJECTED: Set up default type logic identical to Product.jsx
    const defaultType = (product.types && product.types.length > 0) ? product.types[0] : { name: 'Base Unit', multiplier: 1 };

    // INJECTED: Local UI Math state decoupled from the network request
    const [uiMath, setUiMath] = useState({ price: product.price, multiplier: defaultType.multiplier });

    // REPLACED: Updated useForm to include type_name and exclude price/multiplier
    const { data, setData, post, processing, errors, reset } = useForm({
        'product_id': product.id,
        'quantity': 1,
        'type_name': defaultType.name,
    });

    function submit(e) {
        e.preventDefault();
        post(route('customer.addToCart'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Item successfully added to cart!');
            },
            onError: (errs) => {
                if (!flash?.error) {
                    toast.error(Object.values(errs)[0] || 'Failed to add item. Please try again.');
                }
            }
        });
    }

    // Use useEffect to trigger toast notifications from the backend flash
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div>
            {/* Initialize the Sooner Toaster */}
            <Toaster position='top-right' expand={true} richColors />

            <form onSubmit={submit}>
                <nav aria-label="breadcrumb" className='mb-5'>
                    <ol className="breadcrumb fw-semibold">
                        <Link href={route('customer.product')} className="breadcrumb-item text-muted" style={{ textDecoration: 'none' }}>Back</Link>
                        <li className="breadcrumb-item active text-success" aria-current="page">{product.product_name}</li>
                    </ol>
                </nav>

                <div className="row gap-3" style={{ marginBottom: '125px' }}>
                    <div className="col-md-5 text-center">
                        <img
                            src={(product.image?.startsWith('http') ? product.image : `/storage/${product.image}`)}
                            alt="product"
                            className="object-fit-contain"
                            style={{ width: '350px', height: '350px' }}
                        />
                    </div>

                    <div className='col-md-5'>
                        <h1 className='text-success mb-3'>{product.product_name}</h1>
                        <div className="d-flex justify-content-between">
                            <div className='d-flex flex-column gap-2'>
                                <h5>Unit Price</h5>
                                <h5>Stock available</h5>
                            </div>
                            <div className='d-flex flex-column gap-2'>
                                <p className="fw-bold fs-5 text-dark">₱{(uiMath.price * uiMath.multiplier).toFixed(2)}</p>
                                <p>{product.stocks} base pieces left</p>
                            </div>
                        </div>
                        <hr />
                        <h5>Description</h5>
                        <p className=''>{product.description}</p>
                        <hr />

                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Type (Quantifier)</label>
                            <select 
                                className="form-select shadow-sm" 
                                value={JSON.stringify({ name: data.type_name, multiplier: uiMath.multiplier })} 
                                onChange={(e) => {
                                    const parsed = JSON.parse(e.target.value);
                                    setData('type_name', parsed.name);
                                    setUiMath(prev => ({ ...prev, multiplier: parsed.multiplier }));
                                }}
                            >
                                {product.types && product.types.length > 0 ? (
                                    product.types.map(t => (
                                        <option key={t.id} value={JSON.stringify({ name: t.name, multiplier: t.multiplier })}>
                                            {t.name} (Contains {t.multiplier} pcs)
                                        </option>
                                    ))
                                ) : (
                                    <option value={JSON.stringify({ name: 'Base Unit', multiplier: 1 })}>
                                        Base Unit (Contains 1 pc)
                                    </option>
                                )}
                            </select>
                            {errors.type_name && <p className='text-danger mt-2'>{errors.type_name}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="quantity" className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Quantity (Bundles)</label>
                            <input
                                type="number"
                                className="form-control shadow-sm"
                                id='quantity'
                                min='1'
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                            />
                            <small className="text-muted d-block mt-2">Total pieces to deduct: <b>{data.quantity * uiMath.multiplier}</b></small>
                            {errors.quantity && <p className='text-danger mt-2'>{errors.quantity}</p>}
                        </div>

                        <div className="mb-4 d-flex justify-content-between align-items-center bg-light p-3 rounded shadow-sm border">
                            <span className="fw-bold text-dark">Total Price:</span>
                            <span className="fw-bolder fs-4" style={{ color: '#6C63FF' }}>
                                ₱{(uiMath.price * uiMath.multiplier * data.quantity).toFixed(2)}
                            </span>
                        </div>

                        <div className="d-flex align-items-center gap-3 mt-4">
                            <button
                                type='submit'
                                className='btn btn-success shadow-sm d-flex justify-content-center align-items-center gap-2 w-100 py-3 fw-bold fs-6'
                                disabled={processing}
                            >
                                <BsCartFill /> {processing ? 'Adding...' : 'Add to cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

ShowProduct.layout = page => <CustomerLayout children={page} />
export default ShowProduct