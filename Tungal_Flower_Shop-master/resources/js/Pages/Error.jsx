import React from 'react';
import { Head } from '@inertiajs/react';

export default function Error({ status }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
        401: '401: Unauthorized',
        400: '400: Bad Request',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers. We are looking into it.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page or resource.',
        401: 'Sorry, you must be logged in to access this page.',
        400: 'Sorry, your request was invalid or could not be processed.',
    }[status] || 'An unexpected error occurred.';

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 w-100" style={{ backgroundColor: '#F4F5FA', fontFamily: "'Poppins', sans-serif" }}>
            <Head title={title} />
            
            <div className="text-center px-4">
                <h1 className="fw-bolder mb-3" style={{ fontSize: '8rem', color: '#6C63FF', lineHeight: '1' }}>
                    {status}
                </h1>
                <h3 className="h2 mb-3 fw-bold text-dark">
                    {title.split(': ')[1]}
                </h3>
                <p className="text-muted mb-5 fs-5" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    {description}
                </p>
                
                <button 
                    onClick={() => window.history.back()} 
                    className="btn px-5 py-3 fw-bold text-white shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: '#6C63FF', border: 'none', borderRadius: '10px', fontSize: '1rem', transition: 'all 0.2s ease-in-out' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Go Back
                </button>
            </div>
        </div>
    );
}