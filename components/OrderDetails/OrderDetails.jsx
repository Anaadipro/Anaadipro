"use client";
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
export default function OrderDetails({ data }) {
    const [orderStatus, setOrderStatus] = useState(data.status);
    const [isLoading, setIsLoading] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState(data.deliver);
    const [newDeliveryDate, setNewDeliveryDate] = useState(
        data.deliverdate ? new Date(data.deliverdate) : null
    );

    const o = data._id
    const handleStatusUpdate = async (newStatus) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/order/update/${o}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: data._id,
                    status: newStatus,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setOrderStatus(newStatus);
                alert(`Order ${newStatus ? 'approved' : 'unapproved'} successfully!`);
                window.location.reload();
            } else {
                throw new Error(result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeliveryUpdate = async (newStatus) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/order/deliveryupdate/${data._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deliver: newStatus }),
            });

            const result = await response.json();
            if (result.success) {
                setDeliveryStatus(newStatus);
                alert(`Order marked as ${newStatus ? 'Delivered' : 'Not Delivered'} successfully!`);
            } else {
                throw new Error(result.message || 'Failed to update delivery status');
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
            alert('Failed to update delivery status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeliveryDateUpdate = async () => {
        if (!newDeliveryDate) {
            return alert('Please select a valid date.');
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/order/update/${data._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deliverdate: new Date(newDeliveryDate) }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Delivery date updated successfully!');
            } else {
                throw new Error(result.message || 'Failed to update delivery date');
            }
        } catch (error) {
            console.error('Error updating delivery date:', error);
            alert('Failed to update delivery date. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lg:p-8  min-h-screen text-gray-800 dark:text-gray-200">
            <div className="max-w-4xl mx-auto">


                {/* Order Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Order Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>ID:</strong> {data._id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Date:</strong> {new Date(data.date).toLocaleDateString('en-GB')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Transaction ID:</strong> {data.transactionId || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Payment Mode:</strong> {data.paymentmod}</p>
                            <p className="text-sm">
                                <strong>Status:</strong>{' '}
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${orderStatus ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {orderStatus ? 'Completed' : 'Pending'}
                                </span>
                            </p>
                            <p className="text-sm">
                                <strong>Delivery Status:</strong>{' '}
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${deliveryStatus ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {deliveryStatus ? 'Completed' : 'Pending'}
                                </span>
                            </p>
                            {orderStatus && (
                                <p className="text-sm">
                                    <strong>Delivery Date:</strong>{' '}
                                    <DatePicker
                                        selected={newDeliveryDate}
                                        onChange={(date) => setNewDeliveryDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className=""
                                        placeholderText="Select a date"
                                    />
                                    <button
                                        onClick={handleDeliveryDateUpdate}
                                        disabled={isLoading}
                                        className="text-xs bg-green-600 text-white px-2 rounded"
                                    >
                                        {isLoading ? 'Updating...' : 'Update Date'}
                                    </button>
                                </p>
                            )}

                        </div>

                    </div>




                    {/* Approve/Unapprove Buttons */}
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={() => handleStatusUpdate(true)}
                            disabled={orderStatus || isLoading}
                            className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${orderStatus || isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isLoading && !orderStatus ? 'Approving...' : 'Approve'}
                        </button>
                        {orderStatus && (
                            <button
                                onClick={() => handleDeliveryUpdate(true)}
                                disabled={deliveryStatus || isLoading}
                                className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 ${deliveryStatus || isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isLoading && !deliveryStatus ? 'Updating...' : 'Mark as Delivered'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Customer Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>DS Code:</strong> {data.dscode}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>DS Name:</strong> {data.dsname}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Mobile:</strong> {data.mobileno}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Address:</strong> {data.address}</p>
                        </div>
                    </div>
                </div>

                {/* Shipping Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Shipping Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Address:</strong> {data.shippingAddress}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Mobile:</strong> {data.shippingmobile}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Pincode:</strong> {data.shippinpPincode}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Charge:</strong> ₹{data.shippingcharge}</p>
                        </div>
                    </div>
                </div>

                {/* Product Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Products</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left rounded-tl-lg">Product Group</th>
                                    <th className="px-4 py-3 text-left">Product</th>
                                    <th className="px-4 py-3 text-left rounded-tr-lg">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.productDetails.map((product, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <td className="px-4 py-3">{product.productgroup}</td>
                                        <td className="px-4 py-3">{product.product}</td>
                                        <td className="px-4 py-3">{product.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Financial Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Financial Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Sale Group:</strong> {data.salegroup || 'N/A'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>CF Type:</strong> {data.cftype}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Total SP:</strong> ₹{data.totalsp}</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400"><strong>Net Amount:</strong> ₹{data.netamount}</p>
                        </div>
                    </div>
                </div>

                {/* Remarks Card */}
                {data.remarks && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Remarks</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{data.remarks}</p>
                    </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    <p>Created: {new Date(data.createdAt).toLocaleString('en-GB')}</p>
                    <p>Updated: {new Date(data.updatedAt).toLocaleString('en-GB')}</p>
                </div>
            </div>
        </div>
    );
}