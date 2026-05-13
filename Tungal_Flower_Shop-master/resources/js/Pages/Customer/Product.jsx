import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import CustomerLayout from '../../Layout/CustomerLayout';
import ProductCard from '../../Components/ProductCard';
import { Toaster, toast } from 'sonner';

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 18C15.89 18 15 18.89 15 20C15 20.5304 15.2107 21.0391 15.5858 21.4142C15.9609 21.7893 16.4696 22 17 22C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20C19 19.4696 18.7893 18.9609 18.4142 18.5858C18.0391 18.2107 17.5304 18 17 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 15.5304 5.21071 16.0391 5.58579 16.4142C5.96086 16.7893 6.46957 17 7 17H19V15H7.42C7.3537 15 7.29011 14.9737 7.24322 14.9268C7.19634 14.8799 7.17 14.8163 7.17 14.75C7.17 14.7 7.18 14.66 7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.58 17.3 11.97L20.88 5.5C20.95 5.34 21 5.17 21 5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4H5.21L4.27 2M7 18C5.89 18 5 18.89 5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22C7.53043 22 8.03914 21.7893 8.41421 21.4142C8.78929 21.0391 9 20.5304 9 20C9 19.4696 8.78929 18.9609 8.41421 18.5858C8.03914 18.2107 7.53043 18 7 18Z" fill="currentColor"/>
    </svg>
  );
}

function Product({ products }) {
  const { flash } = usePage().props;
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // INJECTED: Local UI Math state decoupled from the network request
  const [uiMath, setUiMath] = useState({ price: 0, multiplier: 1 });

  // REPLACED: Stripped price and multiplier. The client no longer tries to dictate costs.
  const { data, setData, post, processing, reset } = useForm({
    product_id: '',
    quantity: 1,
    type_name: '',
  });

  useEffect(() => {
    if (flash?.error) {
      toast.error(flash.error);
    }
    if (flash?.success) {
      toast.success(flash.success);
    }
  }, [flash]);

  const handleOpenBuyModal = (product) => {
    setSelectedProduct(product);
    const defaultType = (product.types && product.types.length > 0) ? product.types[0] : { name: 'Base Unit', multiplier: 1 };
    
    setData({ 
        product_id: product.id, 
        quantity: 1, 
        type_name: defaultType.name,
    });

    setUiMath({
        price: product.price,
        multiplier: defaultType.multiplier
    });
  };

  const handleCloseBuyModal = () => {
    setSelectedProduct(null);
    reset();
  };

  const submitAddToCart = (e) => {
    e.preventDefault();
    post(route('customer.addToCart'), {
      preserveScroll: true,
      onSuccess: () => {
        handleCloseBuyModal();
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 3000);
      },
      onError: (errors) => {
        if (!flash?.error) {
          toast.error(Object.values(errors)[0] || 'Failed to add item. Please try again.');
        }
      }
    });
  };

  return (
    <div className="container-fluid py-5 px-4 position-relative" style={{ backgroundColor: '#F4F5FA', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <Head title="Products Dashboard" />
      <Toaster position="top-right" richColors expand={true} />

      {showSuccessBanner && (
        <div className="alert alert-success shadow-sm d-flex align-items-center mb-4" role="alert" style={{ backgroundColor: '#F5F4FF', border: '1px solid #dee2e6', borderRadius: '10px', color: '#1E1E1E' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span className="fw-bold">Item successfully added to cart!</span>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-5 mt-3">
        <h1 className="fw-bold m-0" style={{ color: '#1E1E1E', fontSize: '2.5rem' }}>Products</h1>
        
        <div className="d-flex gap-3">
          <Link href={route('customer.cart')} className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm" style={{ backgroundColor: '#6C63FF', border: '1px solid #6C63FF', borderRadius: '10px', height: '52px', padding: '0 24px' }}>
            <CartIcon /> Cart
          </Link>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
        {products?.data?.length > 0 ? (
          products.data.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard
                id={product.id}
                name={product.product_name}
                price={product.price}
                stock={product.stocks}
                image={product.image}
                onBuyClick={() => handleOpenBuyModal(product)}
              />
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 bg-white rounded shadow-sm">
            <p className="text-muted">No products available at the moment.</p>
          </div>
        )}
      </div>

      {/* MODAL: SALES ORDER */}
      {selectedProduct && (
        <div className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 1050 }}>
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px', width: '100%', maxWidth: '450px', backgroundColor: '#FFF' }}>
            <div className="card-header border-0 text-white p-4" style={{ backgroundColor: '#7978E9', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <h4 className="modal-title fw-bold m-0 d-flex justify-content-between align-items-center">
                Sales Order
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseBuyModal}></button>
              </h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={submitAddToCart}>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Flower</label>
                  <input type="text" className="form-control shadow-none bg-light" style={{ borderRadius: '8px' }} value={selectedProduct.product_name} disabled />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Type (Quantifier)</label>
                  <select 
                    className="form-select shadow-none bg-light" 
                    style={{ borderRadius: '8px' }} 
                    value={JSON.stringify({ name: data.type_name, multiplier: uiMath.multiplier })} 
                    onChange={(e) => {
                        const parsed = JSON.parse(e.target.value);
                        setData('type_name', parsed.name);
                        setUiMath(prev => ({ ...prev, multiplier: parsed.multiplier }));
                    }}
                  >
                    {selectedProduct.types && selectedProduct.types.length > 0 ? (
                        selectedProduct.types.map(t => (
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
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Quantity (Bundles)</label>
                  <div className="input-group">
                    <button type="button" className="btn btn-outline-secondary fw-bold" onClick={() => setData('quantity', Math.max(1, data.quantity - 1))}>-</button>
                    <input type="number" className="form-control text-center shadow-none" value={data.quantity} readOnly />
                    <button type="button" className="btn btn-outline-secondary fw-bold" onClick={() => setData('quantity', data.quantity + 1)}>+</button>
                  </div>
                  <small className="text-muted d-block mt-2">Total base pieces to deduct: <b>{data.quantity * uiMath.multiplier}</b></small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Total Price</label>
                  <div className="fw-bold fs-3" style={{ color: '#6C63FF' }}>
                    ₱{(uiMath.price * uiMath.multiplier * data.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-light fw-bold" onClick={handleCloseBuyModal} style={{ borderRadius: '8px' }}>Cancel</button>
                  <button type="submit" className="btn fw-bold text-white px-4" style={{ backgroundColor: '#6C63FF', borderRadius: '8px' }} disabled={processing}>
                    {processing ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Product.layout = page => <CustomerLayout children={page} />;
export default Product;