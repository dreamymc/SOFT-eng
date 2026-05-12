import React from 'react';

const variantStyles = {
    danger: '#DC3545',
    success: '#198754',
    primary: '#7859FF',
    warning: '#EAA144',
};

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'primary',
    isProcessing = false,
    hideCancel = false,
}) {
    if (!isOpen) return null;

    const confirmColor = variantStyles[variant] || variantStyles.primary;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(20, 20, 30, 0.5)', zIndex: 2000 }}>
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', width: '100%', maxWidth: '440px', backgroundColor: '#FFF' }}>
                <div className="card-body p-4 p-md-5 text-center">
                    <h4 className="fw-bolder mb-3" style={{ color: '#1E1E1E' }}>{title}</h4>
                    <p className="text-muted fw-medium mb-4" style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {message}
                    </p>

                    <div className={`d-flex gap-3 ${hideCancel ? 'justify-content-center' : 'justify-content-between'}`}>
                        {!hideCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isProcessing}
                                className="btn w-50 fw-bold text-muted shadow-none"
                                style={{ backgroundColor: '#EBEAEE', borderRadius: '8px', height: '44px' }}
                            >
                                {cancelLabel}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`btn fw-bold text-white shadow-sm border-0 ${hideCancel ? 'px-5' : 'w-50'}`}
                            style={{ backgroundColor: confirmColor, borderRadius: '8px', height: '44px' }}
                        >
                            {isProcessing ? 'Processing...' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
