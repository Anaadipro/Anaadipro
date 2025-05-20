"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function OrderDetails({ data }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const totals = {
        totalDP: 0,
        totalSP: 0,
        totalQty: 0,
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
    data.productDetails.forEach(product => {
        const matchedProduct = getProductDetails(product.product);
        const quantity = product.quantity;

        if (matchedProduct?.dp) {
            totals.totalDP += matchedProduct.dp * quantity;
        }
        if (matchedProduct?.sp) {
            totals.totalSP += matchedProduct.sp * quantity;
        }

        totals.totalQty += quantity;
    });
    return (
        <>
            <div className="mx-auto m-8 p-4 border border-gray-400 rounded shadow text-sm bg-white">
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
                            <span className="font-semibold">Address: </span>{data.address}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Mobile No: </span>{data.mobileno}
                        </div>
                        <div className="border border-gray-800 p-2">
                            <span className="font-semibold">Mobile No: </span>{data.mobileno}
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="mt-5 border-t border-b border-dashed border-gray-500 py-2 my-2 overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-400 text-sm md:text-base">
                        <thead className="bg-gray-100">
                            <tr className="text-left">
                                <th className="border px-2 py-1">Sr.</th>
                                <th className="border px-2 py-1">Product Name</th>
                                <th className="border px-2 py-1">HSN Code</th>
                                <th className="border px-2 py-1">Qty</th>
                                <th className="border px-2 py-1">Rate</th>
                                <th className="border px-2 py-1">Amount</th>
                                <th className="border px-2 py-1">Taxable Value</th>
                                <th className="border px-2 py-1">CGST</th>
                                <th className="border px-2 py-1">SGST</th>
                                <th className="border px-2 py-1">IGST</th>
                                <th className="border px-2 py-1">Total SP</th>
                                <th className="border px-2 py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.productDetails.map((product, index) => {
                                const matchedProduct = getProductDetails(product.product);
                                return (
                                    <tr key={index} className="bg-white">
                                        <td className="border px-2 py-1">{index + 1}</td>
                                        <td className="border px-2 py-1">{product.product}</td>
                                        <td className="border px-2 py-1">{matchedProduct?.hsn || "N/A"}</td>
                                        <td className="border px-2 py-1">{product.quantity}</td>
                                        <td className="border px-2 py-1">{matchedProduct?.dp || "N/A"}</td>
                                        <td className="border px-2 py-1"> {matchedProduct?.dp
                                            ? (matchedProduct.dp * product.quantity).toFixed(2)
                                            : "N/A"}</td>
                                        <td className="border px-2 py-1">-</td>
                                        <td className="border px-2 py-1">-</td>
                                        <td className="border px-2 py-1">-</td>
                                        <td className="border px-2 py-1">-</td>
                                        <td className="border px-2 py-1"> {matchedProduct?.sp
                                            ? (matchedProduct.sp * product.quantity).toFixed(2)
                                            : "N/A"}</td>
                                        <td className="border px-2 py-1"> {matchedProduct?.dp
                                            ? (matchedProduct.dp * product.quantity).toFixed(2)
                                            : "N/A"}</td>
                                    </tr>
                                );
                            })}
                            <tr className="font-semibold bg-gray-50">
                                <td className="border border-gray-400 px-2 py-1 text-center" colSpan={5}>Total</td>
                                <td className="border border-gray-400 px-2 py-1">{totals.totalDP.toFixed(2)}</td>
                                <td className="border border-gray-400 px-2 py-1">Total Taxable Value</td>
                                <td className="border border-gray-400 px-2 py-1">Total CGST</td>
                                <td className="border border-gray-400 px-2 py-1">Total SGST</td>
                                <td className="border border-gray-400 px-2 py-1">Total IGST</td>
                                <td className="border border-gray-400 px-2 py-1">{totals.totalSP.toFixed(2)}</td>
                                <td className="border border-gray-400 px-2 py-1">{totals.totalDP.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Error / Loading */}
                {loading && <p className="text-center text-blue-500">Loading products...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
            </div>
        </>
    );
}
