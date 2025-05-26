"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Fragment } from "react";
export default function Page() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dscode, setDscode] = useState("");
    const [date, setDate] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/user/fetch/user", {
                params: {
                    page,
                    limit: 20,
                    dscode: dscode || undefined,
                    date: date || undefined,
                },
            });
            setData(response.data.data || []);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleFilter = () => {
        setPage(1);
        fetchData();
    };
    const handleClear = () => {
        setDscode("");
        setDate("");
        setPage(1);
        fetchData();
    };
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">User Report</h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search by DS Code"
                    value={dscode}
                    onChange={(e) => setDscode(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                />
                <button
                    onClick={handleFilter}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                    Filter
                </button>
                <button
                    onClick={handleClear}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                    Remove Filter
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <p className="text-center text-red-500 font-semibold py-6">{error}</p>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-900 shadow">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="px-4 py-3">DS Code</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Group</th>
                                    <th className="py-3 px-4">Curent Level</th>
                                    <th className="py-3 px-4">Active Sp</th>
                                    <th className="py-3 px-4">Kyc Status</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Register Date</th>
                                    <th className="px-4 py-3">Activate Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((user, index) => (
                                    <Fragment key={index}>
                                        <tr
                                            className={`border-b text-xs sm:text-sm ${index % 2 === 0
                                                ? "bg-gray-50 dark:bg-gray-800"
                                                : "bg-white dark:bg-gray-900"
                                                }`}
                                        >
                                            <td className="px-4 py-3">{user.dscode}</td>
                                            <td className="px-4 py-3">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">{user.group}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.level || "N/A"}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.activesp || "N/A"}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.kycVerification.isVerified ? "Verified" : "Not Verified"}</td>
                                            <td
                                                className={`px-4 py-3 font-semibold ${user.usertype === "1" ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {user.usertype === "1" ? "Active" : "Inactive"}
                                            </td>
                                            <td className="px-4 py-3">  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}</td>
                                            <td className="px-4 py-3">
                                                {user.activedate
                                                    ? new Date(user.activedate).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "N/A"}
                                            </td>


                                        </tr>
                                        <tr className="bg-gray-100 dark:bg-gray-800">
                                            <td colSpan="10" className="px-4 pb-2 text-right space-x-2">

                                                <Link
                                                    href={`/superadmin/Report/allreport/${user.dscode}`}
                                                    className="text-blue-500 font-semibold underline"
                                                >
                                                    All Report
                                                </Link>
                                                <Link
                                                    href={`/superadmin/Report/UserReportcom/${user.dscode}`}
                                                    className="text-blue-500 font-semibold underline"
                                                >
                                                    Order Report
                                                </Link>
                                                <Link
                                                    href={`/superadmin/Report/UserReportChain/${user.dscode}`}
                                                    className="text-blue-500 font-semibold underline"
                                                >
                                                    Chain Report
                                                </Link>
                                            </td>
                                        </tr>
                                    </Fragment>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center py-6 text-gray-500 font-medium">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1">{`Page ${page} of ${totalPages}`}</span>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
