'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Page() {
    const [data, setData] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0,
        todayRegistrations: 0,
        todayGreen: 0
    });

    useEffect(() => {
        axios.post('/api/panel')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching panel data:", error);
            });
    }, []);

    const BoxItem = ({ number, title, icon }) => (
        <div className="flex flex-col items-start justify-between bg-[#d6c7b0] rounded-xl shadow-md p-5 w-full max-w-xs min-h-[100px] border border-[#a89983]">
            <div className="text-3xl font-semibold text-[#2e2e2e] flex items-center gap-3">
                {icon}
                {number}
            </div>
            <h3 className="text-sm mt-2 text-black tracking-wide font-medium">{title}</h3>
        </div>
    );

    return (
        <div className="lg:p-8">
            <h1 className="text-4xl font-bold mb-10 text-[#2e2e2e] tracking-tight">📊 Dashboard Overview</h1>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 justify-items-center pb-5 border-b-2">
                <Link href="/superadmin/Userprofile/deactiveuser" className="w-full">
                    <BoxItem number={data.pendingUsers} title="Pending Users" icon="🕒" />
                </Link>
                <Link href="/superadmin/Userprofile/activeuser" className="w-full">
                    <BoxItem number={data.activeUsers} title="Active Users" icon="✅" />
                </Link>
                <Link href="/superadmin/Userprofile/susspenduser" className="w-full">
                    <BoxItem number={data.suspendedUsers} title="Suspended Users" icon="🚫" />
                </Link>
                <Link href="/superadmin/Userprofile/user" className="w-full">
                    <BoxItem number={data.totalUsers} title="Total Users" icon="👥" />
                </Link>

                <BoxItem number={data.todayRegistrations} title="Today Registration" icon="📝" />
                <BoxItem number={data.todayGreen} title="Today Green ID" icon="🌱" />
            </div>

            <div className="grid relative gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 justify-items-center mt-5">
                <BoxItem number={5230} title="Total Pair Income" icon="💸" />
                <BoxItem number={110} title="Success Withdrawals" icon="🎉" />
                <BoxItem number={"₹12,500"} title="Pending Withdrawals (Sum)" icon="⌛" />
                <BoxItem number={3} title="Pending Withdrawals (Count)" icon="📥" />
                <div className=' absolute top-0 left-0 right-0 bottom-0 bg-black/10 backdrop-blur-xs'></div>
            </div>
        </div>
    );
}
