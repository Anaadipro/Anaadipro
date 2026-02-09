"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

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
            const response = await axios.get("/api/user/fetchallsusspend/user", {
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
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-4 sm:mb-6">
               Susspend User List
            </h2>
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
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <p className="text-center text-red-500 font-medium py-6">{error}</p>
            ) : (
                <div className="overflow-x-auto border rounded-lg shadow-md bg-white dark:bg-gray-800">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs sm:text-sm">
                                <th className="py-3 px-4">DS Code</th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Group</th>
                                <th className="py-3 px-4">Curent Level</th>
                                <th className="py-3 px-4">Active Sp</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                [...data] // create a shallow copy so original data isn't mutated
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sort by createdAt descending
                                    .map((user, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b dark:border-gray-700 text-xs sm:text-sm ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : "bg-white dark:bg-gray-800"
                                                } hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors`}
                                        >
                                            <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{user.dscode}</td>
                                            <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{user.name}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.group}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.level || "N/A"}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.activesp || "N/A"}</td>
                                            <td
                                                className={`py-3 px-4 font-medium ${user.usertype === "1" ? "text-indigo-600 dark:text-sky-400" : "text-red-600 dark:text-red-500"
                                                    }`}
                                            >
                                                {user.usertype === "1" ? "Active" : "Inactive"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/superadmin/Userprofile/user/${user.email}`}
                                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-6 text-gray-500 dark:text-gray-400 font-medium">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
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
        </div>
    );
}
