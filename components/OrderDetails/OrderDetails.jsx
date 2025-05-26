"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toWords } from 'number-to-words';
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

export default function OrderDetails({ data }) {
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });
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
                await fetch("/api/PaymentHistory/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        dsid: data.dscode,
                        amount: "0",
                        sp: data.totalsp,
                        group: data.salegroup,
                        orderno: data.orderNo,
                        type: "order",
                    }),
                });
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

    const handleStatusUpdatecancle = async (newStatus) => {
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
                await fetch("/api/PaymentHistory/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        dsid: data.dscode,
                        amount: "0",
                        sp: -Math.abs(data.totalsp),
                        group: data.salegroup,
                        orderno: data.orderNo,
                        type: "order",
                    }),
                });
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





    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const totals = {
        totalDP: 0,
        totalSP: 0,
        totalQty: 0,
        totaltax: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
    };

    const extractMainValue = (value) => {
        if (!value) return 0;
        const main = value.toString().split("(")[0]; // remove anything in ()
        return Number(main) || 0;
    };
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get("/api/Product/Product/fetch/s");
                setProducts(response.data.data || []);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Function to get full product info by name
    const getProductDetails = (productName) => {
        return products.find((p) => p.productname === productName);
    };
    data.productDetails.forEach((product) => {
        const matchedProduct = getProductDetails(product.product);
        const quantity = Number(product.quantity) || 0;

        if (!matchedProduct) return;

        const dp = Number(matchedProduct.dp) || 0;
        const sp = Number(matchedProduct.sp) || 0;
        const taxAmount = Number(matchedProduct.taxvalue) || 0;

        totals.totalDP += dp * quantity;
        totals.totalSP += sp * quantity;
        totals.totalQty += quantity;
        totals.totaltax += taxAmount;

        totals.totalCGST += extractMainValue(matchedProduct.cgst);
        totals.totalSGST += extractMainValue(matchedProduct.sgst);
        totals.totalIGST += extractMainValue(matchedProduct.igst);
    });

    const totalDPWords = toWords(Math.round(totals.totalDP));

    return (
        <>


            <button
                onClick={() => reactToPrintFn()}
                className="mt-4 ml-4 bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600"
            >
                Print Page
            </button>

            <div ref={contentRef} className="mx-auto m-8 p-4 border border-gray-400 rounded shadow text-sm bg-white">
                {/* Header */}
                <div className="text-center mb-2">
                    <h1 className="font-bold text-lg">ANAADIPRO WELLNESS PRIVATE LIMITED</h1>
                    <p className="font-semibold">Address - Hore Chandra nagar.</p>
                    <p className="font-semibold">DTR P9 Noel School Gird Gwalior Fort Gwalior Pin code - 474008</p>
                    <p className="font-semibold mt-4">GSTIN : 1234567890</p>
                </div>

                {/* Invoice Info */}
                <div className="border border-gray-400 rounded-lg p-4 w-full mx-auto bg-white text-sm">
                    <div className="text-center font-bold text-base border-b border-gray-800 pb-2 mb-4">
                        Tax Invoice
                    </div>

                    <div className="grid grid-cols-2 gap-0">
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Invoice No.: </span>{data.orderNo}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Transport Mode: </span>
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Invoice Date: </span>{new Date(data.date).toLocaleDateString('en-GB')}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Vehicle Number: </span>
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Reverse Charges (Y/N): </span>NO
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Date Of Supply: </span>
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">State: </span>Rajasthan
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Place Of Supply: </span>
                        </div>
                    </div>
                </div>

                {/* Billing Section */}
                <div className="border border-t-0 border-gray-400 rounded-b-lg p-4 w-full mx-auto bg-white text-sm mt-1">
                    <div className="grid grid-cols-2 gap-0">
                        <div className="border border-gray-800 p-2 text-center font-semibold bg-gray-100">
                            Bill To Party
                        </div>
                        <div className="border border-gray-800 p-2 text-center font-semibold bg-gray-100">
                            Ship To Party
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Name: </span>{data.dsname}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Name: </span>{data.dsname}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Address: </span>{data.address}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Address: </span>{data.shippingAddress},{data.shippinpPincode}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Mobile No: </span>{data.mobileno}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Pincode: </span>{data.shippinpPincode}

                        </div>
                        <div className="border border-gray-800 p-2">
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Mobile No: </span>{data.shippingmobile}

                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="mt-5 border-t border-b border-dashed border-gray-500 py-2 my-2 overflow-x-auto">
                    <table className="w-full border border-black border-collapse mb-2">
                        <thead>
                            <tr>
                                <th className="border p-1">#</th>
                                <th className="border p-1">Product</th>
                                <th className="border p-1">HSN</th>
                                <th className="border p-1">Qty</th>
                                <th className="border p-1">Rate</th>
                                <th className="border p-1">Amount</th>
                                <th className="border p-1">Taxable</th>
                                <th className="border p-1">CGST</th>
                                <th className="border p-1">SGST</th>
                                <th className="border p-1">IGST</th>
                                <th className="border p-1">Total SP</th>
                                <th className="border p-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.productDetails.map((product, index) => {
                                const matched = getProductDetails(product.product);
                                return (
                                    <tr key={index}>
                                        <td className="border p-1 text-center">{index + 1}</td>
                                        <td className="border p-1">{product.product}</td>
                                        <td className="border p-1">{matched?.hsn || "-"}</td>
                                        <td className="border p-1">{product.quantity}</td>
                                        <td className="border p-1">{matched?.dp || "-"}</td>
                                        <td className="border p-1">{matched?.dp ? (matched.dp * product.quantity).toFixed(2) : "-"}</td>
                                        <td className="border p-1">{matched?.taxvalue || "-"}</td>
                                        <td className="border p-1">{matched?.cgst || "-"}</td>
                                        <td className="border p-1">{matched?.sgst || "-"}</td>
                                        <td className="border p-1">{matched?.igst || "-"}</td>
                                        <td className="border p-1">{matched?.sp ? (matched.sp * product.quantity).toFixed(2) : "-"}</td>
                                        <td className="border p-1">{matched?.dp ? (matched.dp * product.quantity).toFixed(2) : "-"}</td>
                                    </tr>
                                );
                            })}
                            <tr className="font-bold">
                                <td colSpan={5} className="border p-1 text-center">Total</td>
                                <td className="border p-1">{totals.totalDP.toFixed(2)}</td>
                                <td className="border p-1">{totals.totaltax.toFixed(2)}</td>
                                <td className="border p-1">{totals.totalCGST.toFixed(2)}</td>
                                <td className="border p-1">{totals.totalSGST.toFixed(2)}</td>
                                <td className="border p-1">{totals.totalIGST.toFixed(2)}</td>
                                <td className="border p-1">{totals.totalSP.toFixed(2)}</td>
                                <td className="border p-1">{totals.totalDP.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <div className="border border-t-0 border-gray-400 rounded-b-lg w-full mx-auto bg-white text-sm mt-1">
                    <div className="lg:grid grid-cols-2">
                        <div className="border flex justify-center flex-col items-center">
                            <p className=" font-medium mb-4 underline">Total Invoice Amount in words</p>
                            <p className=" capitalize font-semibold text-lg">{totalDPWords}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-0">

                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">Total Amount Before Tax</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">
                                    ₹{" "}
                                    {(
                                        Number(totals.totalDP.toFixed(2)) -
                                        (Number(totals.totalIGST.toFixed(2)) +
                                            Number(totals.totalSGST.toFixed(2)) +
                                            Number(totals.totalCGST.toFixed(2)))
                                    ).toFixed(2)}
                                </span>
                            </div>

                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">Add CGST</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold"> ₹ {totals.totalCGST.toFixed(2)}</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">Add SGST</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold"> ₹ {totals.totalSGST.toFixed(2)}</span>
                            </div>

                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">Add IGST</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold"> ₹ {totals.totalIGST.toFixed(2)}</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">Total Tax Amount</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold"> ₹ {(Number(totals.totalIGST.toFixed(2)) + Number(totals.totalSGST.toFixed(2)) + Number(totals.totalCGST.toFixed(2))).toFixed(2)}</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold">Total Amount After Tax</span>
                            </div>
                            <div className="border border-gray-800 p-2">
                                <span className="font-semibold"> ₹ {totals.totalDP.toFixed(2)}</span>
                            </div>

                        </div>
                    </div>

                </div>
                <div className="border border-t-0 border-gray-400 rounded-b-lg w-full mx-auto bg-white text-sm mt-1">
                    <div className="lg:grid grid-cols-3">
                        <div className="border flex justify-end flex-col items-center">
                            <p className=" font-medium mb-4 ">Common Seal</p>
                        </div>
                        <div className="col-span-2">


                            <div className="border border-gray-800 p-2 text-center">
                                <span className="font-semibold">Certified that the particulars given above are true and corret </span>
                            </div>
                            <div className="border border-gray-800 p-2 text-center">
                                <span className="font-semibold">For ANAADIPRO WELLNESS PRIVATE LIMITED</span>
                            </div>
                            <div className="border border-gray-800 p-2 text-center">
                                <span className="font-semibold">Authorized Signatory</span>
                            </div>

                        </div>
                    </div>

                </div>


                {/* Error / Loading */}
                {loading && <p className="text-center text-blue-500">Loading products...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
            </div>



            <div className="w-full max-w-md mt-6 p-4 bg-white border border-gray-300 rounded shadow-sm">
                {orderStatus && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date:</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            <DatePicker
                                selected={newDeliveryDate}
                                onChange={(date) => setNewDeliveryDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-40"
                                placeholderText="Select a date"
                            />
                            <button
                                onClick={handleDeliveryDateUpdate}
                                disabled={isLoading}
                                className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition"
                            >
                                {isLoading ? 'Updating...' : 'Update Date'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => handleStatusUpdate(true)}
                        disabled={orderStatus || isLoading}
                        className={`flex-1 py-2 px-4 rounded text-white font-semibold transition duration-200 ${orderStatus || isLoading
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
                            className={`flex-1 py-2 px-4 rounded text-white font-semibold transition duration-200 ${deliveryStatus || isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isLoading && !deliveryStatus ? 'Updating...' : 'Mark as Delivered'}
                        </button>
                    )}
                    {orderStatus && (
                        <>
                            {!deliveryStatus && (
                                <button

                                    onClick={() => handleStatusUpdatecancle(false)}
                                    className="flex-1 py-2 px-4 rounded text-white font-semibold transition duration-200 bg-red-600 hover:bg-red-700"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
