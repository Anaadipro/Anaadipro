'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
export default function Page() {
    const [levelData, setLevelData] = useState([]);

    useEffect(() => {
        const fetchLevelData = async () => {
            try {
                const response = await axios.get('/api/level/levelAchivers');
                if (response.data.success) {
                    setLevelData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching level data:", error);
            }
        };

        fetchLevelData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">🎖️ Level-wise User Count</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-gray-800">
                        <tr>
                            <th className="px-6 py-3 border-b">Sr.</th>
                            <th className="px-6 py-3 border-b">Level Name</th>
                            <th className="px-6 py-3 border-b">User Count</th>
                            <th className="px-6 py-3 border-b">View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levelData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-3 border-b">{index + 1}</td>
                                <td className="px-6 py-3 border-b font-semibold ">{item.level}</td>
                                <td className="px-6 py-3 border-b">{item.userCount}</td>
                                <td className="px-6 py-3 border-b">
                                    <Link href={`/superadmin/Userprofile/levelachivers/${item.level}`}>
                                        <span className=' bg-blue-400 text-white px-2 rounded'>View</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {levelData.length === 0 && (
                            <tr>
                                <td colSpan="2" className="text-center py-6 text-gray-500">
                                    Wait
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
