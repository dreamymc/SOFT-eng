import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CustomerLayout from '../../Layout/CustomerLayout';
import ProductCard from '../../Components/ProductCard';

function BackIcon() { return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function TrashIcon() { return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="#FF4D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#FF4D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function CartIcon() { return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 18C15.89 18 15 18.89 15 20C15 20.5304 15.2107 21.0391 15.5858 21.4142C15.9609 21.7893 16.4696 22 17 22C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20C19 19.4696 18.7893 18.9609 18.4142 18.5858C18.0391 18.2107 17.5304 18 17 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 15.5304 5.21071 16.0391 5.58579 16.4142C5.96086 16.7893 6.46957 17 7 17H19V15H7.42C7.3537 15 7.29011 14.9737 7.24322 14.9268C7.19634 14.8799 7.17 14.8163 7.17 14.75C7.17 14.7 7.18 14.66 7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.58 17.3 11.97L20.88 5.5C20.95 5.34 21 5.17 21 5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4H5.21L4.27 2M7 18C5.89 18 5 18.89 5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22C7.53043 22 8.03914 21.7893 8.41421 21.4142C8.78929 21.0391 9 20.5304 9 20C9 19.4696 8.78929 18.9609 8.41421 18.5858C8.03914 18.2107 7.53043 18 7 18Z" fill="currentColor"/></svg>); }
function RefundIcon() { return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22.0049 7H2.00488V4C2.00488 3.73478 2.11024 3.48043 2.29778 3.29289C2.48531 3.10536 2.73967 3 3.00488 3H21.0049C21.2701 3 21.5245 3.10536 21.712 3.29289C21.8995 3.48043 22.0049 3.73478 22.0049 4V7ZM22.0049 9V20C22.0049 20.2652 21.8995 20.5196 21.712 20.7071C21.5245 20.8946 21.2701 21 21.0049 21H3.00488C2.73967 21 2.48531 20.8946 2.29778 20.7071C2.11024 20.5196 2.00488 20.2652 2.00488 20V9H22.0049ZM11.0049 14V11.5L6.50488 16H17.0049V14H11.0049Z" fill="currentColor"/></svg>); }

function Cart({ carts, total, products }) {
  const { auth } = usePage().props;
  const cartList = carts?.data || [];
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // INJECTED: Added Order Type, Customer Details, and Payment Tracking
  const { data, setData, post, processing, errors, reset } = useForm({
    cart_id: [],
    total: 0,
    cash_received: '',
    discount_percentage: '',
    discount_amount: 0,
    order_type: 'Walk-in',
    customer_name: '',
    customer_address: '',
    payment_method: 'Cash',
    reference_number: ''
  });

  const numericTotal = parseFloat(total) || 0;
  
  // Live Discount Math
  const discountAmount = data.discount_percentage ? (numericTotal * (Number(data.discount_percentage) / 100)) : 0;
  const grandTotal = numericTotal - discountAmount;

  const handleRemove = (cartId) => {
    router.get(route('customer.removeItem', { cart_id: cartId }), {}, { preserveScroll: true });
  };

  const handleOpenPayment = () => {
    setData(prev => ({
      ...prev,
      cart_id: cartList.map(item => item.id),
      total: grandTotal,
      discount_amount: discountAmount,
      cash_received: ''
    }));
    setShowPaymentModal(true);
  };

  const submitPayment = (e) => {
    e.preventDefault();
    post(route('customer.checkout'), {
      preserveScroll: true,
      onSuccess: () => {
        setShowPaymentModal(false);
        reset();
      }
    });
  };

  const numericCash = parseFloat(data.cash_received) || 0;
  
  // Validation Logic based on new constraints
  const isDeliveryValid = data.order_type === 'Walk-in' || (data.order_type === 'Delivery' && data.customer_address.trim() !== '');
  const isPaymentMethodValid = data.payment_method === 'Cash' || (['Gcash', 'Bank Transfer'].includes(data.payment_method) && data.reference_number.trim() !== '');
  // If cash, must have enough. If Gcash/Bank, assume exact amount passed via API/validation rules, but local state can enforce grandTotal match
  const isCashValid = data.payment_method === 'Cash' ? (numericCash >= grandTotal && data.cash_received !== '') : (numericCash >= grandTotal);
  
  const isPaymentValid = isDeliveryValid && isPaymentMethodValid && isCashValid;
  const changeAmount = isPaymentValid ? (numericCash - grandTotal).toFixed(2) : '0.00';

  return (
    <div className="position-relative" style={{ minHeight: '100vh', backgroundColor: '#F5F4FF' }}>
      <Head title="Sales Order Details" />

      {/* BACKGROUND (BLURRED) */}
      <div className="container-fluid py-5 px-4" style={{ filter: showPaymentModal ? 'blur(3px)' : 'none', opacity: showPaymentModal ? 0.5 : 1, transition: 'all 0.3s ease' }}>
        <div className="mb-2">
          <h4 className="text-muted fw-normal" style={{ color: '#1E1E1E' }}>
            Hi, {auth?.user ? auth.user.firstname : 'User'}!
          </h4>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-5 mt-3">
          <h1 className="fw-bold m-0" style={{ color: '#1E1E1E', fontSize: '2.5rem' }}>Products</h1>
          <div className="d-flex gap-3">
            <button className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm" style={{ backgroundColor: '#7DA0FA', borderRadius: '10px', height: '56px' }}>
              <RefundIcon /> Request Refund
            </button>
            <button className="btn d-flex align-items-center gap-2 fw-bold text-white shadow-sm" style={{ backgroundColor: '#6C63FF', borderRadius: '10px', height: '56px' }}>
              <CartIcon /> Cart
            </button>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          {products?.data?.length > 0 && products.data.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard id={product.id} name={product.product_name} price={product.price} stock={product.stocks} image={product.image} onBuyClick={() => {}} />
            </div>
          ))}
        </div>
      </div>

      {/* FOREGROUND DIALOG: CART */}
      {!showPaymentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', backgroundColor: '#F5F4FF', minHeight: '80vh' }}>
              
              <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center gap-3">
                <Link 
                    href={route('customer.product')} 
                    className="btn btn-light shadow-sm d-flex align-items-center justify-content-center"
                    style={{ width: '50px', height: '50px', borderRadius: '10px', border: '1px solid #dee2e6' }}
                >
                  <BackIcon />
                </Link>
                <h2 className="fw-bold m-0" style={{ color: '#1E1E1E' }}>Sales Order Details</h2>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Left Side: Product List */}
                  <div className="col-12 col-xl-8">
                    <div className="d-flex flex-column gap-3">
                      {cartList.length > 0 ? (
                        cartList.map((item) => (
                          <div key={item.id} className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <div className="card-body p-3 d-flex align-items-center justify-content-between">
                              
                              <div className="d-flex align-items-center gap-3" style={{ width: '40%' }}>
                                <img src={`/storage/${item.product.image}`} alt={item.product.product_name} className="object-fit-cover" style={{ width: '80px', height: '80px', borderRadius: '10px' }} />
                                <div>
                                    <span className="fw-bold fs-5 text-dark d-block text-truncate">{item.product.product_name}</span>
                                    <small className="text-muted d-block">{item.type_name} (x{item.multiplier})</small>
                                </div>
                              </div>

                              <div className="d-flex align-items-center justify-content-center gap-3" style={{ width: '20%' }}>
                                <span className="text-muted fw-bold">Qty:</span>
                                <span className="fw-bold fs-5">{item.quantity}</span>
                              </div>

                              <div className="d-flex align-items-center justify-content-end gap-4" style={{ width: '40%' }}>
                                <span className="fw-bold fs-4" style={{ color: '#6C63FF' }}>₱{item.subtotal}</span>
                                <button onClick={() => handleRemove(item.id)} className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <TrashIcon />
                                </button>
                              </div>

                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                          <div className="card-body p-5 text-center text-muted">
                            <h4>Your cart is empty.</h4>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Order Summary */}
                  <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#FFFFFF' }}>
                      <div className="card-body p-4 d-flex flex-column h-100">
                        <h5 className="fw-bold mb-4" style={{ color: '#1E1E1E' }}>Order Summary</h5>
                        
                        <div className="mb-4">
                            <label className="form-label text-muted fw-bold mb-2" style={{ fontSize: '13px' }}>Apply Discount (%)</label>
                            <div className="input-group">
                                <input 
                                    type="number" 
                                    className="form-control shadow-none" 
                                    placeholder="0" 
                                    min="0" max="100"
                                    value={data.discount_percentage} 
                                    onChange={(e) => setData('discount_percentage', e.target.value)} 
                                    disabled={cartList.length === 0}
                                />
                                <span className="input-group-text bg-light text-muted fw-bold">%</span>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mb-3">
                          <span className="text-muted fw-semibold">Subtotal</span>
                          <span className="fw-bold text-dark">₱{numericTotal.toFixed(2)}</span>
                        </div>
                        
                        {discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-3 text-danger">
                                <span className="fw-semibold">Discount (-{data.discount_percentage}%)</span>
                                <span className="fw-bold">-₱{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        {/* REPLACED: Tax Row Removed */}

                        <hr style={{ borderColor: '#dee2e6' }} />
                        <div className="d-flex justify-content-between align-items-center my-4">
                          <span className="fw-bold fs-5" style={{ color: '#1E1E1E' }}>Grand Total</span>
                          <span className="fw-bold fs-3" style={{ color: '#7978E9' }}>₱{grandTotal.toFixed(2)}</span>
                        </div>

                        <button 
                          onClick={handleOpenPayment}
                          disabled={!cartList.length}
                          className="btn w-100 fw-bold text-white py-3 mt-auto"
                          style={{ backgroundColor: '#6C63FF', borderRadius: '10px', fontSize: '1.1rem' }}
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FOREGROUND DIALOG: PROCESS PAYMENT & DELIVERY */}
      {showPaymentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className="modal-header border-0 text-white" style={{ backgroundColor: '#7978E9' }}>
                <h5 className="modal-title fw-bold">Checkout & Payment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={submitPayment}>
                  
                  <div className="row g-4">
                    {/* LEFT COLUMN: Customer & Delivery Info */}
                    <div className="col-12 col-md-6 border-end">
                      <h6 className="fw-bold mb-3" style={{ color: '#1E1E1E' }}>Order Information</h6>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Order Type</label>
                        <select 
                            className="form-select shadow-none bg-light" 
                            style={{ borderRadius: '8px' }}
                            value={data.order_type}
                            onChange={(e) => setData('order_type', e.target.value)}
                        >
                            <option value="Walk-in">Walk-in (Shop)</option>
                            <option value="Delivery">Delivery</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold text-dark" style={{ fontSize: '14px' }}>Customer Name (Optional for Walk-in)</label>
                        <input 
                            type="text" 
                            className="form-control shadow-none bg-light" 
                            style={{ borderRadius: '8px' }}
                            placeholder="John Doe"
                            value={data.customer_name}
                            onChange={(e) => setData('customer_name', e.target.value)}
                        />
                      </div>

                      {data.order_type === 'Delivery' && (
                        <div className="mb-3">
                          <label className="form-label fw-bold text-danger" style={{ fontSize: '14px' }}>Delivery Address *</label>
                          <textarea 
                              className="form-control shadow-none bg-light" 
                              style={{ borderRadius: '8px', resize: 'none' }}
                              rows="3"
                              placeholder="123 Flower Street, Garden City"
                              value={data.customer_address}
                              onChange={(e) => setData('customer_address', e.target.value)}
                              required={data.order_type === 'Delivery'}
                          ></textarea>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Payment Processing */}
                    <div className="col-12 col-md-6">
                      <div className="mb-4 text-center">
                        <p className="text-muted mb-1" style={{ fontSize: '13px' }}>Amount Due</p>
                        <h2 className="fw-bolder m-0" style={{ color: '#6C63FF', fontSize: '38px' }}>₱{grandTotal.toFixed(2)}</h2>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold" style={{ color: '#1E1E1E', fontSize: '14px' }}>Mode of Payment</label>
                        <select 
                            className="form-select shadow-none bg-light" 
                            style={{ borderRadius: '8px' }}
                            value={data.payment_method}
                            onChange={(e) => setData('payment_method', e.target.value)}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Gcash">GCash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>

                      {['Gcash', 'Bank Transfer'].includes(data.payment_method) && (
                        <div className="mb-3">
                          <label className="form-label fw-bold text-danger" style={{ fontSize: '14px' }}>Reference Number *</label>
                          <input 
                              type="text" 
                              className="form-control shadow-none bg-light" 
                              style={{ borderRadius: '8px' }}
                              placeholder="e.g. 000123456789"
                              value={data.reference_number}
                              onChange={(e) => setData('reference_number', e.target.value)}
                              required
                          />
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label fw-bold" style={{ color: '#1E1E1E', fontSize: '14px' }}>Amount Received (₱)</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 fw-bold text-muted">₱</span>
                          <input 
                            type="number" 
                            className="form-control bg-light border-start-0 fw-bold text-dark" 
                            placeholder="0.00"
                            step="0.01"
                            min={grandTotal}
                            required
                            value={data.cash_received}
                            onChange={(e) => setData('cash_received', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-bold" style={{ color: '#1E1E1E', fontSize: '14px' }}>Change</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 fw-bold text-muted">₱</span>
                          <input type="text" className="form-control bg-light border-start-0 fw-bold text-success" value={changeAmount} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: '#dee2e6' }} />

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" className="btn btn-light fw-bold text-muted px-4" onClick={() => setShowPaymentModal(false)} style={{ borderRadius: '10px' }}>Cancel</button>
                    <button type="submit" className="btn fw-bold text-white px-4" style={{ backgroundColor: '#6C63FF', borderRadius: '10px' }} disabled={processing || !isPaymentValid}>
                      {processing ? 'Processing...' : 'Confirm Transaction'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

Cart.layout = page => <CustomerLayout children={page} />;
export default Cart;