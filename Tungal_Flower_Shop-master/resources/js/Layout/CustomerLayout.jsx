import React from 'react';
import { Link, usePage } from '@inertiajs/react';

// Main SVGs 
function ShoppingBagIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 22C5.45 22 4.97933 21.8043 4.588 21.413C4.19667 21.0217 4.00067 20.5507 4 20V8C4 7.45 4.196 6.97933 4.588 6.588C4.98 6.19667 5.45067 6.00067 6 6H8C8 4.9 8.39167 3.95833 9.175 3.175C9.95833 2.39167 10.9 2 12 2C13.1 2 14.0417 2.39167 14.825 3.175C15.6083 3.95833 16 4.9 16 6H18C18.55 6 19.021 6.196 19.413 6.588C19.805 6.98 20.0007 7.45067 20 8V20C20 20.55 19.8043 21.021 19.413 21.413C19.0217 21.805 18.5507 22.0007 18 22H6ZM10 6H14C14 5.45 13.8043 4.97933 13.413 4.588C13.0217 4.19667 12.5507 4.00067 12 4C11.4493 3.99933 10.9787 4.19533 10.588 4.588C10.1973 4.98067 10.0013 5.45133 10 6ZM15 11C15.2833 11 15.521 10.904 15.713 10.712C15.905 10.52 16.0007 10.2827 16 10V8H14V10C14 10.2833 14.096 10.521 14.288 10.713C14.48 10.905 14.7173 11.0007 15 11ZM9 11C9.28333 11 9.521 10.904 9.713 10.712C9.905 10.52 10.0007 10.2827 10 10V8H8V10C8 10.2833 8.096 10.521 8.288 10.713C8.48 10.905 8.71733 11.0007 9 11Z" fill="currentColor"/></svg>); }
function OrdersIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 3.75H5.25V21.75H18.75V3.75H15M7.5 17.25H16.5M9 5.25H15L15.75 2.25H8.25L9 5.25ZM9 15L11.25 14.25L15.75 9.75L14.25 8.25L9.75 12.75L9 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>); }
function LogoutIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 18.25C11.8011 18.25 11.6103 18.329 11.4697 18.4697C11.329 18.6103 11.25 18.8011 11.25 19C11.25 19.1989 11.329 19.3897 11.4697 19.5303C11.6103 19.671 11.8011 19.75 12 19.75H18C18.4641 19.75 18.9092 19.5656 19.2374 19.2374C19.5656 18.9092 19.75 18.4641 19.75 18V6C19.75 5.53587 19.5656 5.09075 19.2374 4.76256C18.9092 4.43437 18.4641 4.25 18 4.25H12C11.8011 4.25 11.6103 4.32902 11.4697 4.46967C11.329 4.61032 11.25 4.80109 11.25 5C11.25 5.19891 11.329 5.38968 11.4697 5.53033C11.6103 5.67098 11.8011 5.75 12 5.75H18C18.0663 5.75 18.1299 5.77634 18.1768 5.82322C18.2237 5.87011 18.25 5.9337 18.25 6V18C18.25 18.0663 18.2237 18.1299 18.1768 18.1768C18.1299 18.2237 18.0663 18.25 18 18.25H12Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M14.5029 14.365C15.1929 14.365 15.7529 13.805 15.7529 13.115V10.875C15.7529 10.185 15.1929 9.62498 14.5029 9.62498H9.8899L9.8699 9.40498L9.8159 8.84898C9.79681 8.65261 9.73064 8.46373 9.62301 8.29838C9.51538 8.13302 9.36946 7.99606 9.19763 7.8991C9.0258 7.80214 8.83312 7.74805 8.63593 7.74142C8.43874 7.73478 8.24286 7.77579 8.0649 7.86098C6.42969 8.64307 4.94977 9.71506 3.6969 11.025L3.5979 11.128C3.37433 11.3612 3.24951 11.6719 3.24951 11.995C3.24951 12.3181 3.37433 12.6287 3.5979 12.862L3.6979 12.965C4.95047 14.2748 6.43005 15.3468 8.0649 16.129C8.24286 16.2142 8.43874 16.2552 8.63593 16.2485C8.83312 16.2419 9.0258 16.1878 9.19763 16.0909C9.36946 15.9939 9.51538 15.8569 9.62301 15.6916C9.73064 15.5262 9.79681 15.3374 9.8159 15.141L9.8699 14.585L9.8899 14.365H14.5029ZM9.1949 12.865C9.00405 12.8651 8.82044 12.938 8.68147 13.0688C8.54249 13.1996 8.45861 13.3785 8.4469 13.569C8.42823 13.859 8.4049 14.1493 8.3769 14.44L8.3609 14.602C7.05583 13.9285 5.86846 13.0481 4.8449 11.995C5.86846 10.9418 7.05583 10.0614 8.3609 9.38798L8.3769 9.54998C8.4049 9.83998 8.42823 10.1303 8.4469 10.421C8.45861 10.6115 8.54249 10.7903 8.68147 10.9211C8.82044 11.0519 9.00405 11.1248 9.1949 11.125H14.2529V12.865H9.1949Z" fill="currentColor"/></svg>); }

export default function CustomerLayout({ children }) {
  const { auth } = usePage().props;
  const currentRoute = route().current();

  // Helper for active styling on the left sidebar links
  const getNavLinkClass = (routeName) => {
    return currentRoute === routeName
      ? 'btn d-flex align-items-center gap-3 text-start text-white border-0 bg-white bg-opacity-25 fw-bold w-100'
      : 'btn d-flex align-items-center gap-3 text-start text-white border-0 hover-bg-light w-100';
  };

  return (
    <div className="d-flex" style={{ height: '100vh', backgroundColor: '#F5F4FF', overflow: 'hidden', fontFamily: "'Poppins', sans-serif" }}>

      {/* WEST QUADRANT SIDEBAR - NOW USING PRODUCT CARD COLOR */}
      <aside className="d-flex flex-column text-white shadow-lg flex-shrink-0" style={{ width: '250px', backgroundColor: '#7978E9' }}>
        
        {/* Header */}
        <div className="d-flex flex-column align-items-center justify-content-center py-4 border-bottom border-light border-opacity-25">
          <span className="fw-bolder fs-5 tracking-wider text-center px-2">TUNGAL'S FLOWER SHOP</span>
          <span className="badge bg-light text-dark mt-2 shadow-sm">POS System</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="d-flex flex-column gap-2 px-3 flex-grow-1 mt-4">
          <Link href={route('customer.product')} className={getNavLinkClass('customer.product')}>
            <ShoppingBagIcon /> Products
          </Link>
          
          <Link href={route('customer.orders')} className={getNavLinkClass('customer.orders')}>
            <OrdersIcon /> Orders
          </Link>
        </nav>

        {/* Bottom Left Profile & Logout */}
        <div className="p-4 border-top border-light border-opacity-25 d-flex flex-column align-items-center">
          <Link href={route('customer.profile')} className="d-flex flex-column align-items-center text-decoration-none text-white mb-3 w-100">
            <img
              src={auth?.user?.profile ? (auth.user.profile?.startsWith('http') ? auth.user.profile : `/storage/${auth.user.profile}`) : '/assets/images/profile.png'}
              alt="User avatar"
              className="rounded-circle object-fit-cover shadow-sm border border-2 border-white mb-2"
              style={{ width: '60px', height: '60px' }}
            />
            <span className="fw-bold text-center" style={{ fontSize: '15px' }}>
              {auth?.user ? `${auth.user.firstname} ${auth.user.lastname}` : 'Cashier'}
            </span>
            <span className="text-white-50" style={{ fontSize: '12px' }}>Active Register</span>
          </Link>

          <Link 
            href={route('employee.logout')} 
            method="post" 
            as="button" 
            className="btn w-100 fw-bold text-white d-flex justify-content-center align-items-center gap-2 shadow-sm" 
            style={{ backgroundColor: '#D84B51', borderRadius: '8px' }}
          >
            <LogoutIcon /> Log Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 overflow-auto p-4 w-100">
        {children}
      </main>

    </div>
  );
}