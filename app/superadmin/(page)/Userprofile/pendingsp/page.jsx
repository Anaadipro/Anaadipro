"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Link from "next/link";

export default function Page() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dscode, setDscode] = useState("");
    const [date, setDate] = useState("");
    const [error, setError] = useState("");
    const [userStats, setUserStats] = useState({});

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

            const users = response.data.data || [];
            setData(users);
            setTotalPages(response.data.totalPages);

            const statResults = await Promise.all(
                users.map(async (user) => {
                    try {
                        const res = await axios.get(`/api/dashboard/de/${user.dscode}`);
                        if (res.data?.success) {
                            return {
                                dscode: user.dscode,
                                totalSaoSP: res.data.totalSaoSP,
                                totalSgoSP: res.data.totalSgoSP,
                            };
                        }
                        return null;
                    } catch {
                        return null;
                    }
                })
            );

            const statMap = {};
            statResults.forEach((stat) => {
                if (stat) {
                    statMap[stat.dscode] = {
                        totalSaoSP: stat.totalSaoSP,
                        totalSgoSP: stat.totalSgoSP,
                    };
                }
            });

            setUserStats(statMap);
        } catch (err) {
            console.error(err);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchData();
    };

    return (
        <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Users Pending Sp</h1>

            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <input
                    type="text"
                    value={dscode}
                    onChange={(e) => setDscode(e.target.value)}
                    placeholder="Enter DS Code"
                    className="border border-gray-300 p-2 rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Search
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">It Take Some Time Please Wait...</p>
            ) : error ? (
                <p className="text-red-600 font-medium">{error}</p>
            ) : (
                <>
                    <div className="overflow-x-auto rounded shadow-sm">
                        <table className="min-w-full text-sm bg-white border border-gray-200">
                            <thead className="bg-blue-50 text-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 border">Sr No</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">DS Code</th>
                                    <th className="px-4 py-2 border">Phone</th>
                                    <th className="px-4 py-2 border">Total SAO SP</th>
                                    <th className="px-4 py-2 border">Total SGO SP</th>
                                    <th className="px-4 py-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((user, index) => {
                                    const stats = userStats[user.dscode] || {};
                                    return (
                                        <tr key={user._id} className="text-center hover:bg-gray-50">
                                            <td className="px-4 py-2 border">{(page - 1) * 20 + index + 1}</td>
                                            <td className="px-4 py-2 border">{user.name}</td>
                                            <td className="px-4 py-2 border">{user.dscode}</td>
                                            <td className="px-4 py-2 border">{user.mobileNo}</td>
                                            <td className="px-4 py-2 border text-green-600 font-semibold">
                                                {stats.totalSaoSP !== undefined ? stats.totalSaoSP : "Loading..."}
                                            </td>
                                            <td className="px-4 py-2 border text-indigo-600 font-semibold">
                                                {stats.totalSgoSP !== undefined ? stats.totalSgoSP : "Loading..."}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                <Link
                                                    href={`/superadmin/Userprofile/user/${user.email}`}
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
