"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
export default function Page() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/level/fetch/level");
                setData(response.data.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="lg:p-6 p-2">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-white text-center mb-6">Level List</h2>

            {loading ? (
                <div className="h-96 flex flex-col gap-2">
                    <div className="w-full h-7 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-full h-7 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-full h-7 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-full h-7 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            ) : error ? (
                <p className="text-center text-red-500 font-semibold">{error}</p>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full border border-gray-200 dark:border-white shadow-lg rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
                                <th className="py-3 px-4 border-r">Sn No</th>
                                <th className="py-3 px-4 border-r">Level Name</th>
                                <th className="py-3 px-4 border-r">Sao</th>
                                <th className="py-3 px-4 border-r">Sgo</th>
                                <th className="py-3 px-4 border-r">Sales Commision </th>
                                <th className="py-3 px-4">Sales Growth </th>
                                <th className="py-3 px-4">Performance Income</th>
                                <th className="py-3 px-4">Prize</th>
                                <th className="py-3 px-4">Tour</th>
                                <th className="py-3 px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                [...data]
                                    .sort((a, b) => a.sao - b.sao)
                                    .map((data, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : "bg-white dark:bg-gray-800"
                                                } hover:bg-blue-100 dark:hover:bg-gray-600 text-black dark:text-white transition duration-200`}
                                        >
                                            <td className="py-3 text-sm font-medium px-4 border-r">{index + 1}</td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.level_name}</td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.sao}</td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.sgo}</td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.binary_income} </td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.bonus_income} </td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.performance_income} </td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.bonus}</td>
                                            <td className="py-3 text-sm font-medium px-4 border-r">{data.tour}</td>
                                            <td className="py-3 text-sm font-medium px-4 border-r"><Link href={`./update/${data._id}`}>Edit</Link></td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-500 font-medium">
                                        No data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}
