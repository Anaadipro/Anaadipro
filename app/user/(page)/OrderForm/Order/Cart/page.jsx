"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Page() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { data: session } = useSession();
    const [dsid, setDsid] = useState("");

    // Effect to get the user's DSID from their session email
    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                if (response.data?.dscode) {
                    setDsid(response.data?.dscode);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setError("Unable to fetch user details.");
            }
        };
        fetchUserData();
    }, [session?.user?.email]);

    // Effect to fetch the cart once the DSID is available
    useEffect(() => {
        const fetchCart = async () => {
            if (!dsid) return;
            setLoading(true);
            setError("");
            try {
                const response = await axios.get(`/api/cart/userall/${dsid}`);
                setCart(response.data.data || []);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch products.");
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [dsid]);

    // Recalculate totals whenever the cart changes
    const totalSp = cart.reduce((sum, item) => sum + Number(item.totalsp || 0), 0);
    const totalAmount = cart.reduce((sum, item) => sum + Number(item.netamount || 0), 0);

    // ✅ 1. Check if any item in cart exceeds available stock
    const isCheckoutDisabled = cart.some(item =>
        item.productDetails.some(pd =>
            Number(pd.quantity) > Number(pd.availableQuantity)
        )
    );

    const handleQuantityChange = async (itemIndex, pdIndex, change) => {
        const currentItem = cart[itemIndex];
        const currentPd = currentItem.productDetails[pdIndex];
        const newQuantity = Number(currentPd.quantity) + Number(change);

        // ✅ 2. Prevent quantity from going above available stock
        if (change > 0 && newQuantity > Number(currentPd.availableQuantity)) {
            setError(`Cannot add more. Only ${currentPd.availableQuantity} available in stock.`);
            return; // Stop the function
        }

        if (newQuantity < 1) return;
        setError(""); // Clear previous errors

        // The rest of your update logic remains the same
        const updatedPd = { ...currentPd, quantity: String(newQuantity) };
        const updatedProductDetails = [...currentItem.productDetails];
        updatedProductDetails[pdIndex] = updatedPd;

        let updatedTotalSP = 0;
        let updatedNetAmount = 0;
        updatedProductDetails.forEach((p) => {
            updatedTotalSP += Number(p.sp) * Number(p.quantity);
            updatedNetAmount += Number(p.price) * Number(p.quantity);
        });

        const updatedCartItem = {
            productDetails: updatedProductDetails,
            totalsp: String(updatedTotalSP),
            netamount: String(updatedNetAmount),
        };

        try {
            await axios.patch(`/api/cart/update/${currentItem._id}`, updatedCartItem);
            const updatedCart = [...cart];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                ...updatedCartItem,
            };
            setCart(updatedCart);
        } catch (error) {
            console.error("Update failed", error);
            setError("Failed to update quantity.");
        }
    };

    const handleRemoveItem = async (id) => {
        try {
            await axios.delete(`/api/cart/delete/${id}`);
            setCart((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            setError("Failed to remove item.");
        }
    };

    return (
        <div>
            <div className="flex justify-end">
                <Link
                    href="./CreateOrder"
                    className="bg-blue-700 px-3 py-1 rounded text-white hover:bg-blue-800 transition"
                >
                    Add Product
                </Link>
            </div>

            <div className=" p-4 mt-4 rounded-md ">
                <h2 className="text-lg font-semibold mb-3 dark:text-white text-gray-800">Cart</h2>
                {/* Display a clear error message if there's an issue with stock */}
                {error && <div className="text-red-600 py-4 text-center font-semibold">{error}</div>}

                {loading ? (
                    <div className="text-center text-blue-600 font-medium py-4">Loading cart...</div>
                ) : cart.length === 0 ? (
                    <p className="text-gray-600">No items in cart.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead>
                                <tr className="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white">
                                    <th className="py-2 px-4 border text-left">Product</th>
                                    <th className="py-2 px-4 border text-center">Quantity</th>
                                    <th className="py-2 px-4 border text-center">Total SP</th>
                                    <th className="py-2 px-4 border text-center">Total Price</th>
                                    <th className="py-2 px-4 border text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, itemIndex) =>
                                    item.productDetails.map((pd, pdIndex) => {
                                        const isOutOfStock = Number(pd.quantity) > Number(pd.availableQuantity);
                                        return (
                                            <tr key={`${itemIndex}-${pdIndex}`} className={`border-t ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                                <td className="py-2 px-4 border text-gray-500 dark:text-white">
                                                   {isOutOfStock && <div className="font-semibold bg-red-600 text-white text-center rounded animate-pulse">Out of Stock   Available: {pd.availableQuantity || 0}</div> }
                                                    <span className="font-semibold text-gray-600 dark:text-white">{pd.product}</span>
                                                    <br />
                                                    Group: {pd.productgroup}
                                                    <br />
                                                    Price: {pd.price}
                                                    <br />
                                                    Sp: {pd.sp}
                                                    <br />
                                                     {/* ✅ 3. Display available quantity */}
                                                    <span className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                                                        Available: {pd.availableQuantity || 0}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 border text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(itemIndex, pdIndex, -1)}
                                                            className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-2 text-gray-800 dark:text-white">{pd.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(itemIndex, pdIndex, 1)}
                                                            className="bg-green-500 text-white px-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                             // ✅ 4. Disable button if cart quantity meets or exceeds stock
                                                            disabled={Number(pd.quantity) >= Number(pd.availableQuantity)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 border text-center text-gray-800 dark:text-white">{item.totalsp}</td>
                                                <td className="py-2 px-4 border text-center text-gray-800 dark:text-white">{item.netamount}</td>
                                                <td className="py-2 px-4 border text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                        
                        <div className="flex justify-center items-center w-full">
                            <div className="mt-10 w-full max-w-md bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100 tracking-wide">
                                    🛒 Cart Summary
                                </h3>
                                <div className="flex justify-between items-center text-base mb-3 px-1">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">Total Amount:</span>
                                    <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                                        ₹{totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-base mb-6 px-1">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium">Total SP:</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                        {totalSp.toFixed(2)}
                                    </span>
                                </div>
                                 {/* ✅ 5. Disable checkout link if items are out of stock */}
                                <Link
                                    href={isCheckoutDisabled ? "#" : "./Checkout"}
                                    onClick={(e) => { if (isCheckoutDisabled) e.preventDefault(); }}
                                    title={isCheckoutDisabled ? "Cannot proceed. Some items in your cart exceed available stock." : "Proceed to Checkout"}
                                    className={`w-full block text-center bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 font-semibold tracking-wide ${isCheckoutDisabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:shadow-xl hover:scale-[1.01]'
                                        }`}
                                >
                                    🚀 Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}