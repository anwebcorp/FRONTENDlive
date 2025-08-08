import React, { useState, useEffect } from "react"; 
import axiosInstance from "./axiosInstance";

// Receive user and setUser as props instead of using AuthContext
function SupplierInfo({ user, setUser }) {
  const [supplierData, setSupplierData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("my-profile/"); 
        setSupplierData(response.data);
        setError(null);
      } catch (apiError) {
        console.error("Failed to fetch supplier data:", apiError);
        setError("Failed to load supplier data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    // Fetch supplier payments
    const fetchSupplierPayments = async () => {
      setPaymentsLoading(true);
      setPaymentsError(null);
      try {
        // API endpoint: /api/payments/ (returns all payments for logged-in supplier)
        const res = await axiosInstance.get('payments/');
        setPayments(res.data);
        setPaymentsError(null);
      } catch (err) {
        setPaymentsError("Failed to load payments.");
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };
    // Ensure user is defined and is a supplier before fetching
    if (user && user.isSupplier) {
      fetchSupplierData();
    } else {
      setLoading(false);
      setError("You are not authorized to view this page.");
    }
    // Fetch payments after supplierData is loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch payments when supplierData is loaded
  useEffect(() => {
    if (supplierData && supplierData.id) {
      // Fetch all payments for the logged-in supplier
      const fetchSupplierPayments = async () => {
        setPaymentsLoading(true);
        setPaymentsError(null);
        try {
          const res = await axiosInstance.get('payments/');
          setPayments(res.data);
          setPaymentsError(null);
        } catch (err) {
          setPaymentsError("Failed to load payments.");
          setPayments([]);
        } finally {
          setPaymentsLoading(false);
        }
      };
      fetchSupplierPayments();
    }
  }, [supplierData]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Clear user from local storage
    window.location.href = "/login"; // Redirect to login
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 font-sans">
      <p className="text-neutral-700">Loading supplier data...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 font-sans">
      <div className="text-red-600 text-center p-4 bg-red-100 rounded-lg shadow-md">
        <p>{error}</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 relative overflow-hidden p-4">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-between rounded-xl mb-4">
        <h1 className="text-xl font-semibold text-neutral-900 text-center flex-grow">
          Supplier Profile
        </h1>
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors duration-200 ease-in-out shadow-md"
          title="Sign Out"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className="absolute right-full mr-3 px-3 py-1 bg-neutral-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 ease-in-out whitespace-nowrap pointer-events-none">
            Sign Out
          </span>
        </button>
      </div>

      {supplierData ? (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg mx-auto max-w-md mb-8">
            <div className="flex flex-col items-center mb-6">
              {supplierData.profile_image ? (
                <img
                  src={supplierData.profile_image}
                  alt="Supplier Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-md mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-sm border-4 border-blue-600 shadow-md mb-4">
                  No Image
                </div>
              )}
              <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">{supplierData.name || 'N/A'}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center bg-neutral-100 p-3 rounded-lg">
                <strong className="text-neutral-700 w-1/3">CNIC:</strong>
                <span className="text-neutral-900 w-2/3 break-words">{supplierData.cnic || 'N/A'}</span>
              </div>
              <div className="flex items-center bg-neutral-100 p-3 rounded-lg">
                <strong className="text-neutral-700 w-1/3">Phone:</strong>
                <span className="text-neutral-900 w-2/3">{supplierData.contact_number || 'N/A'}</span>
              </div>
              <div className="flex items-center bg-neutral-100 p-3 rounded-lg">
                <strong className="text-neutral-700 w-1/3">Username:</strong>
                <span className="text-neutral-900 w-2/3">{supplierData.user?.username || 'N/A'}</span>
              </div>
              <div className="flex items-center bg-neutral-100 p-3 rounded-lg">
                <strong className="text-neutral-700 w-1/3">Email:</strong>
                <span className="text-neutral-900 w-2/3">{supplierData.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center bg-neutral-100 p-3 rounded-lg">
                <strong className="text-neutral-700 w-1/3">First Name:</strong>
                <span className="text-neutral-900 w-2/3">{supplierData.user?.first_name || 'N/A'}</span>
              </div>
              <div className="flex items-center bg-neutral-100 p-3 rounded-lg">
                <strong className="text-neutral-700 w-1/3">Last Name:</strong>
                <span className="text-neutral-900 w-2/3">{supplierData.user?.last_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div className="bg-white p-6 rounded-2xl shadow-2xl mx-auto max-w-4xl border border-gray-200 mt-8">
            <h2 className="text-2xl font-extrabold text-blue-700 mb-6 tracking-wide flex items-center">
              <svg className="w-7 h-7 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
              Payment History
            </h2>
            {paymentsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : paymentsError ? (
              <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg shadow-md">{paymentsError}</div>
            ) : payments.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No payments found.</div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {payments.map((payment) => {
                  const paidAmount = payment.paid_amount !== undefined
                    ? Number(payment.paid_amount)
                    : payment.transactions?.reduce((sum, t) => sum + Number(t.paid_by_company ?? 0), 0);
                  return (
                    <div key={payment.id} className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl shadow-xl p-6 flex flex-col space-y-4 hover:shadow-2xl transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-blue-800 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
                          {payment.material_name}
                        </h3>
                        <div>
                          {payment.status === 'Paid' && (
                            <span className="inline-block px-3 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">Paid</span>
                          )}
                          {payment.status === 'Partially Paid' && (
                            <span className="inline-block px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">Partially Paid</span>
                          )}
                          {payment.status === 'Unpaid' && (
                            <span className="inline-block px-3 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full">Unpaid</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-gray-700">
                        <div>
                          <span className="block text-xs text-gray-500">Quantity</span>
                          <span className="font-semibold">{String(Number(payment.total_quantity ?? 0)).replace(/\.00$/, '')}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Rate/Unit</span>
                          <span className="font-semibold">{String(Number(payment.rate_per_unit ?? 0)).replace(/\.00$/, '')}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Total Amount</span>
                          <span className="font-semibold">{String(Number(payment.total_amount ?? 0)).replace(/\.00$/, '')}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Paid</span>
                          <span className="font-semibold text-green-700">{String(Number(paidAmount ?? 0)).replace(/\.00$/, '')}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Remaining</span>
                          <span className="font-semibold text-red-700">{String(Number(payment.remaining_amount ?? 0)).replace(/\.00$/, '')}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Created</span>
                          <span className="font-semibold">{new Date(payment.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Note</span>
                        <span className="block text-gray-800 bg-blue-50 rounded p-2 min-h-[2rem]">{payment.note || <span className="text-gray-400">No note</span>}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="block text-xs text-gray-500">Bill:</span>
                        {payment.bill_image ? (
                          <a href={typeof payment.bill_image === 'string' && payment.bill_image.startsWith('/') ? payment.bill_image : (payment.bill_image_url || payment.bill_image)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">View Bill</a>
                        ) : (
                          <span className="text-gray-400">No Bill</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-neutral-600 text-center mt-8">No supplier data found.</p>
      )}
    </div>
  );
}

export default SupplierInfo;