import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Layout/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import AddProduct from './Inventory_Features/AddProduct'; 
import UpdateProduct from './Inventory_Features/UpdateProduct';
import ConfirmModal from '../../Components/ConfirmModal';

const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" cy="21" x2="16.65" y2="16.65"></line></svg>);
const PlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const ArrowLeft = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const ArrowRight = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 19"></polyline></svg>);
const UpdateIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const DeleteIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const CheckCircle = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="#7859FF" stroke="#7859FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" fill="none"></path><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" fill="none"></polyline></svg>);

const formatLocalTime = (dateString) => {
    if (!dateString) return 'Just Now';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

function Inventory({ products }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [flowerToUpdate, setFlowerToUpdate] = useState(null);

    const [selectedFlower, setSelectedFlower] = useState(null);
    const [batchToStockOut, setBatchToStockOut] = useState(null);

    // Batch Management State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        product_id: '',
        quantity: '',
        expiry_date: '',
        expiry_time: '',
    });
    const { delete: destroy, processing: isStockOutProcessing } = useForm();

    const productList = products?.data ? products.data : products || [];

    // ACTIVE STATE SYNC
    useEffect(() => {
        if (selectedFlower) {
            const freshFlowerData = productList.find(p => p.id === selectedFlower.id);
            if (freshFlowerData) {
                setSelectedFlower(freshFlowerData);
            }
        }
    }, [products]);

    const filteredProducts = productList.filter((prod) => {
        const term = searchQuery.toLowerCase();
        return (
            (prod.product_name && prod.product_name.toLowerCase().includes(term)) ||
            (prod.description && prod.description.toLowerCase().includes(term)) ||
            (prod.types && prod.types.some(t => t.name.toLowerCase().includes(term))) 
        );
    });

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Calculate Active Stock
    const calculateTotalActiveStock = (product) => {
        if (!product || !product.batches) return parseInt(product?.stocks) || 0;
        return product.batches
            .filter(batch => batch.status === 'active')
            .reduce((sum, batch) => sum + parseInt(batch.quantity), 0);
    };

    const openUpdateModal = (e, product) => {
        e.stopPropagation(); 
        setFlowerToUpdate(product);
        setIsUpdateModalOpen(true);
    };

    // Batch Modal Handlers
    const openBatchModal = () => {
        if (!selectedFlower) return;
        setData('product_id', selectedFlower.id);
        setIsBatchModalOpen(true);
    };

    const closeBatchModal = () => {
        setIsBatchModalOpen(false);
        reset();
    };

    transform((data) => ({
        ...data,
        expires_at: data.expiry_date ? `${data.expiry_date} ${data.expiry_time || '23:59:59'}` : null,
    }));

    const handleAddBatch = (e) => {
        e.preventDefault();
        post(route('admin.batches.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('quantity', 'expiry_date', 'expiry_time');
                toast.success('Stock batch added successfully!');
            },
            onErrors: () => toast.error('Failed to add stock batch. Check your inputs.')
        });
    };

    const handleStockOutBatch = (batchId) => {
        setBatchToStockOut(batchId);
    };

    const confirmStockOutBatch = () => {
        if (!batchToStockOut) return;

        destroy(route('admin.batches.destroy', batchToStockOut), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Batch manually stocked out.');
                setBatchToStockOut(null);
            }
        });
    };

    return (
        <div className="container-fluid py-5 px-5" style={{ minHeight: '100vh', backgroundColor: '#F4F5FA', fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Inventory" />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bolder m-0" style={{ color: '#1E1E1E', fontSize: '32px' }}>Inventory</h2>

                <div className="d-flex gap-4 align-items-center">
                    <div className="d-flex justify-content-center align-items-center rounded-pill px-4" style={{ backgroundColor: '#EBEAEE', width: '320px', height: '48px' }}>
                        <SearchIcon />
                        <input
                            type="text"
                            className="form-control border-0 bg-transparent shadow-none ms-2"
                            placeholder="Search flower..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '14px', color: '#1E1E1E' }}
                        />
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn d-flex align-items-center gap-2 fw-semibold text-white px-4 rounded-4 shadow-sm border-0" style={{ backgroundColor: '#7859FF', height: '48px', fontSize: '15px' }}>
                        <PlusIcon /> Add Flower
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0 w-100 overflow-hidden mb-4" style={{ borderRadius: '16px', backgroundColor: '#FFF' }}>
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0" style={{ minWidth: '1000px' }}>
                        <thead style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid #EBEAEE' }}>
                            <tr>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '13px', width: '10%' }}>ID</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '13px', width: '28%' }}>Flower Details</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '13px', width: '15%' }}>Quantifiers / Types</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '13px', width: '8%' }}>Base Qty</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '13px', width: '9%' }}>Price</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '13px', width: '15%' }}>Last Updated</th>
                                <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '13px', width: '15%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProducts.length > 0 ? (
                                displayedProducts.map((product) => {
                                    const isSelected = selectedFlower?.id === product.id;
                                    const activeStock = calculateTotalActiveStock(product);

                                    return (
                                        <tr 
                                            key={product.id} 
                                            onClick={() => setSelectedFlower(product)}
                                            style={{ 
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#F4F1FF' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                boxShadow: isSelected ? 'inset 4px 0 0 0 #7859FF' : 'none' 
                                            }} 
                                            className="border-bottom position-relative"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{ width: '18px' }}>
                                                        {isSelected ? <CheckCircle /> : null}
                                                    </div>
                                                    <span className="fw-bold" style={{ fontSize: '14px', color: isSelected ? '#7859FF' : '#1E1E1E' }}>
                                                        {String(product.id).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-3 overflow-hidden flex-shrink-0 shadow-sm" style={{ width: '48px', height: '48px', backgroundColor: '#F4F5FA', border: isSelected ? '2px solid #7859FF' : 'none' }}>
                                                        <img src={product.image ? (product.image?.startsWith('http') ? product.image : `/storage/${product.image}`) : '/assets/images/product.png'} alt={product.product_name} className="w-100 h-100 object-fit-cover" />
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{product.product_name}</h6>
                                                        <p className="text-muted mb-0 text-truncate" style={{ fontSize: '12px', maxWidth: '200px' }}>{product.description || 'No description provided'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-dark fw-medium" style={{ fontSize: '12px' }}>
                                                {product.types && product.types.length > 0 
                                                    ? product.types.map(t => `${t.name} (x${t.multiplier})`).join(', ') 
                                                    : <span className="text-muted fst-italic">Base Unit Only</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="fw-bold" style={{ fontSize: '14px', color: activeStock > 0 ? '#1E1E1E' : '#DC3545' }}>{activeStock}</span>
                                            </td>
                                            <td className="py-3 px-4 text-dark fw-bold" style={{ fontSize: '14px' }}>₱ {product.price}</td>
                                            
                                            <td className="py-3 px-4 text-muted fw-medium" style={{ fontSize: '13px' }}>
                                                {formatLocalTime(product.updated_at)}
                                            </td>

                                            <td className="py-3 px-4">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button 
                                                        className="btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold shadow-none border-0" 
                                                        onClick={(e) => openUpdateModal(e, product)} 
                                                        style={{ backgroundColor: '#EBF0FF', color: '#7859FF', borderRadius: '6px', fontSize: '12px', padding: '6px 10px' }}
                                                    >
                                                        <UpdateIcon /> Update
                                                    </button>
                                                    <button className="btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold shadow-none border-0" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#FFEBEE', color: '#DC3545', borderRadius: '6px', fontSize: '12px', padding: '6px 10px' }}>
                                                        <DeleteIcon /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No flowers found in inventory.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 0 && (
                    <div className="d-flex justify-content-end align-items-center gap-3 py-3 pe-4 border-top" style={{ backgroundColor: '#F8F9FA' }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn shadow-none p-0 m-0 d-flex align-items-center gap-1 fw-medium" style={{ fontSize: '14px', color: currentPage === 1 ? '#A0A0A0' : '#5A637A', background: 'none', border: 'none' }}>
                            <ArrowLeft /> Previous
                        </button>
                        <div className="d-flex gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                const isActive = pageNum === currentPage;
                                return (
                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className="btn d-flex justify-content-center align-items-center rounded-2 fw-bold border-0 shadow-none p-0" style={{ width: '28px', height: '28px', backgroundColor: isActive ? '#7859FF' : 'transparent', color: isActive ? 'white' : '#7E869E', fontSize: '13px' }}>
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn shadow-none p-0 m-0 d-flex align-items-center gap-1 fw-medium" style={{ fontSize: '14px', color: currentPage === totalPages ? '#A0A0A0' : '#5A637A', background: 'none', border: 'none' }}>
                            Next <ArrowRight />
                        </button>
                    </div>
                )}
            </div>

            <div className="d-flex flex-column align-items-end gap-2 mt-3">
                <div className="d-flex gap-3">
                    <button 
                        onClick={openBatchModal}
                        disabled={!selectedFlower}
                        className="btn fw-bold text-white shadow-sm border-0 transition-all d-flex justify-content-center align-items-center" 
                        style={{ backgroundColor: selectedFlower ? '#7859FF' : '#B8A8FF', cursor: selectedFlower ? 'pointer' : 'not-allowed', borderRadius: '8px', height: '44px', width: '200px', fontSize: '15px' }}
                    >
                        Manage Batches
                    </button>
                </div>
                {!selectedFlower ? (
                    <small className="text-danger fw-bold mt-1" style={{fontSize: '12px'}}>* Click a row to unlock batch management</small>
                ) : (
                    <small className="text-success fw-bold mt-1" style={{fontSize: '12px'}}>✓ Ready to manage: {selectedFlower.product_name}</small>
                )}
            </div>

            {/* Batch Management Modal */}
            {isBatchModalOpen && selectedFlower && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold" style={{ color: '#1E1E1E' }}>
                                    Manage Batches: <span style={{ color: '#7859FF' }}>{selectedFlower.product_name}</span>
                                </h5>
                                <button type="button" className="btn-close shadow-none" onClick={closeBatchModal}></button>
                            </div>
                            
                            <div className="modal-body px-4 py-4">
                                {/* Add Batch Form */}
                                <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: '#F8F9FA', border: '1px solid #EBEAEE' }}>
                                    <h6 className="fw-bold mb-3" style={{ fontSize: '14px', color: '#5A637A' }}>Add New Stock Batch</h6>
                                    <form onSubmit={handleAddBatch} className="d-flex gap-3 align-items-end">
                                        <div className="flex-grow-1" style={{ maxWidth: '120px' }}>
                                            <label className="form-label mb-1 fw-medium" style={{ fontSize: '13px', color: '#5A637A' }}>Quantity</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                className="form-control shadow-none" 
                                                value={data.quantity} 
                                                onChange={e => setData('quantity', e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <label className="form-label mb-1 fw-medium" style={{ fontSize: '13px', color: '#5A637A' }}>Expiry Date (Optional)</label>
                                            <div className="d-flex gap-2">
                                                <input 
                                                    type="date" 
                                                    className="form-control shadow-none" 
                                                    value={data.expiry_date} 
                                                    onChange={e => setData('expiry_date', e.target.value)} 
                                                />
                                                <input 
                                                    type="time" 
                                                    className="form-control shadow-none" 
                                                    value={data.expiry_time} 
                                                    onChange={e => setData('expiry_time', e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <button 
                                                type="submit" 
                                                disabled={processing} 
                                                className="btn text-white fw-semibold px-4 transition-all" 
                                                style={{ backgroundColor: '#28A745', height: '38px', borderRadius: '8px' }}
                                            >
                                                {processing ? 'Adding...' : 'Stock In'}
                                            </button>
                                        </div>
                                    </form>
                                    {errors.quantity && <small className="text-danger mt-1 d-block">{errors.quantity}</small>}
                                    {errors.expires_at && <small className="text-danger mt-1 d-block">{errors.expires_at}</small>}
                                </div>

                                {/* Batch History Table */}
                                <h6 className="fw-bold mb-2" style={{ fontSize: '14px', color: '#5A637A' }}>Batch History</h6>
                                <div className="table-responsive border rounded-3" style={{ maxHeight: '250px' }}>
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light sticky-top">
                                            <tr>
                                                <th className="py-2 px-3 text-muted fw-semibold" style={{ fontSize: '12px' }}>Batch ID</th>
                                                <th className="py-2 px-3 text-muted fw-semibold" style={{ fontSize: '12px' }}>Date Received</th>
                                                <th className="py-2 px-3 text-muted fw-semibold" style={{ fontSize: '12px' }}>Quantity</th>
                                                <th className="py-2 px-3 text-muted fw-semibold" style={{ fontSize: '12px' }}>Expires At</th>
                                                <th className="py-2 px-3 text-muted fw-semibold" style={{ fontSize: '12px' }}>Status</th>
                                                <th className="py-2 px-3 text-muted fw-semibold text-end" style={{ fontSize: '12px', minWidth: '150px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedFlower.batches && selectedFlower.batches.length > 0 ? (
                                                selectedFlower.batches.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(batch => (
                                                    <tr key={batch.id} style={{ opacity: batch.status !== 'active' ? 0.6 : 1 }}>
                                                        <td className="px-3 fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                            #{String(batch.id).padStart(3, '0')}
                                                        </td>
                                                        <td className="px-3 text-dark" style={{ fontSize: '13px' }}>
                                                            {new Date(batch.received_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-3 fw-bold text-dark" style={{ fontSize: '13px' }}>
                                                            {batch.quantity}
                                                        </td>
                                                        <td className="px-3 text-danger" style={{ fontSize: '13px' }}>
                                                            {batch.expires_at ? new Date(batch.expires_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-3">
                                                            {/* FIX: Status display logic updated to handle 'fully_sold' */}
                                                            <span className={`badge rounded-pill ${batch.status === 'active' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '11px', fontWeight: '500' }}>
                                                                {batch.status === 'manually_removed' 
                                                                    ? 'REMOVED' 
                                                                    : batch.status === 'fully_sold' 
                                                                        ? 'FULLY SOLD' 
                                                                        : batch.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 text-end">
                                                            {batch.status === 'active' ? (
                                                                <button 
                                                                    onClick={() => handleStockOutBatch(batch.id)} 
                                                                    className="btn btn-sm btn-outline-danger shadow-none" 
                                                                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}
                                                                >
                                                                    Stock Out
                                                                </button>
                                                            ) : (
                                                                <div className="d-flex flex-column text-muted text-end" style={{ fontSize: '11px' }}>
                                                                    {/* FIX: Label logic for sold vs expired */}
                                                                    <span>{batch.status === 'manually_removed' ? 'Stocked out:' : (batch.status === 'fully_sold' ? 'Sold at:' : 'Expired:')}</span>
                                                                    <span className="fw-medium">{formatLocalTime(batch.updated_at)}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-muted" style={{ fontSize: '13px' }}>
                                                        No batches found for this product.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AddProduct isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            
            <UpdateProduct isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} flower={flowerToUpdate} />

            <ConfirmModal
                isOpen={!!batchToStockOut}
                title="Stock Out Batch?"
                message="This will manually remove the active batch quantity from inventory."
                confirmLabel="Stock Out"
                variant="danger"
                isProcessing={isStockOutProcessing}
                onCancel={() => setBatchToStockOut(null)}
                onConfirm={confirmStockOutBatch}
            />
        </div>
    );
}

Inventory.layout = page => <AdminLayout children={page} />;
export default Inventory;
