"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

export default function Page() {
    const { data: session } = useSession();
    const [ds, setds] = useState("");
    const [payment, setPayment] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;
            setLoading(true);
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                if (response) {
                    setds(response.data.dscode);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast.error("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [session?.user?.email]);

    useEffect(() => {
        const fetchPayment = async () => {
            if (!ds) return;
            setLoading(true);
            try {
                const response = await axios.get(`/api/Payment/userall/${ds}`);
                if (response) {
                    setPayment(response.data.data);
                    setFilteredPayments(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch payment data:", error);
                toast.error("Failed to load payment data");
            } finally {
                setLoading(false);
            }
        };
        fetchPayment();
    }, [ds]);

    useEffect(() => {
        if (!fromDate && !toDate) {
            setFilteredPayments(payment);
            return;
        }

        const filteredPayments = payment.filter((item) => {
            const itemDate = new Date(item.createdAt);
            const start = fromDate ? new Date(fromDate) : null;
            const end = toDate ? new Date(toDate) : null;

            if (end) {
                end.setHours(23, 59, 59, 999);
            }

            return (
                (!start || itemDate >= start) &&
                (!end || itemDate <= end)
            );
        });


        setFilteredPayments(filteredPayments);
    }, [fromDate, toDate, payment]);
    const totalAmount = filteredPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalTDS = filteredPayments.reduce((sum, item) => sum + Number(item.tds || 0), 0);
    const netAmount = filteredPayments.reduce((sum, item) => sum + Number(item.payamount || 0), 0);
    return (
        <div className="p-4 md:p-6 text-sm">
            <Toaster />
            <h1 className="text-xl md:text-2xl text-blue-400 border-b pb-2 mb-4 capitalize">
                Payment Ledger
            </h1>

            <div className="flex flex-wrap gap-4 items-end mb-6">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">From Date</label>
                    <DatePicker
                        selected={fromDate}
                        onChange={(date) => setFromDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="border border-gray-500 px-2 py-1 w-40 text-gray-800"
                        placeholderText="Select date"
                        maxDate={new Date()}
                        isClearable
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">To Date</label>
                    <DatePicker
                        selected={toDate}
                        onChange={(date) => setToDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="border border-gray-500 px-2 py-1 w-40 text-gray-800"
                        placeholderText="Select date"
                        maxDate={new Date()}
                        isClearable
                    />
                </div>
            </div>

            {loading ? (
                <p className="text-gray-600">Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-400 text-left text-gray-800">
                        <thead className="bg-gray-100 border-b border-gray-400">
                            <tr>
                                <th className="px-4 py-2 border-r">S. No.</th>
                                <th className="px-4 py-2 border-r">Amount</th>
                                <th className="px-4 py-2 border-r">Tds (5%)</th>
                                <th className="px-4 py-2 border-r">Pay Amount</th>
                                <th className="px-4 py-2 border-r">Account Holder</th>
                                <th className="px-4 py-2 border-r">Account Number</th>
                                <th className="px-4 py-2 border-r">IFSC</th>
                                <th className="px-4 py-2 border-r">Bank Name</th>
                                <th className="px-4 py-2 border-r">Branch</th>
                                <th className="px-4 py-2 border-r">Bank Reference No.</th>
                                <th className="px-4 py-2 border-r">Status</th>
                                <th className="px-4 py-2 border-r">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-4 text-gray-500">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((item, index) => (
                                    <tr key={item.id || index} className="border-t border-gray-300 hover:bg-gray-50">
                                        <td className="px-4 py-2 border-r">{index + 1}</td>
                                        <td className="px-4 py-2 border-r">{item.amount}</td>
                                        <td className="px-4 py-2 border-r">{item.tds}</td>
                                        <td className="px-4 py-2 border-r">{item.payamount}</td>
                                        <td className="px-4 py-2 border-r">{item.accountholder}</td>
                                        <td className="px-4 py-2 border-r">{item.accountNumber}</td>
                                        <td className="px-4 py-2 border-r">{item.ifsc}</td>
                                        <td className="px-4 py-2 border-r">{item.bankname}</td>
                                        <td className="px-4 py-2 border-r">{item.branch}</td>
                                        <td className="px-4 py-2 border-r">{item.bankreferencenumber}</td>
                                        <td className="px-4 py-2 border-r">{item.status == 1 ? "Paid" : "Pending"}</td>
                                        <td className="px-4 py-2 border-r">
                                            {format(new Date(item.createdAt), "d MMM yyyy")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>



                    <div className=" flex flex-col gap-2 font-semibold mt-2">
                        <p>Total Amount : ₹{totalAmount}</p>
                        <p>Total TDS : ₹{totalTDS}</p>
                        <p>Net Amount : ₹{netAmount}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
