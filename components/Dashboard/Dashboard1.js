"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function Dashboard1() {
    const { data: session } = useSession();
    const [dsid, setDsid] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                setDsid(response.data.dscode);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchUserData();
    }, [session?.user?.email]);

    useEffect(() => {
        if (!dsid) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/dashboard/teamsp/${dsid}`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dsid]);

    if (loading) return <SkeletonLoader />;
    if (error) return <p className="text-red-500 text-center font-semibold">{error}</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 dark:bg-gray-900">
            <DashboardGroup title="Team SP">
                <DashboardCard title="SAO Team SP" value={data?.totalSaoSP || 0} />
                <DashboardCard title="SGO Team SP" value={data?.totalSgoSP || 0} />
            </DashboardGroup>

            <DashboardGroup title="Team ID">
                <DashboardCard title="SAO Team ID" value={data?.totalSAO || 0} />
                <DashboardCard title="SGO Team ID" value={data?.totalSGO || 0} />
            </DashboardGroup>

            <DashboardGroup title="Total Team">
                <DashboardCard2 title="SAO Total Team" value={data?.totalActiveSAO || 0} value1={data?.totalSAO || 0} />
                <DashboardCard2 title="SGO Total Team" value={data?.totalActiveSGO || 0} value1={data?.totalSGO || 0} />
            </DashboardGroup>
        </div>
    );
}

function DashboardGroup({ title, children }) {
    return (
        <div className="">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function DashboardCard({ title, value }) {
    return (
        <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border overflow-hidden">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-sky-500"></div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">{title}:</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
        </div>
    );
}

function DashboardCard2({ title, value, value1 }) {
    return (
        <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border overflow-hidden">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-sky-500"></div>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">{title}:</p>
            <div className="flex gap-2 items-center">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{value}</p>
                <p>/</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{Math.max(0, value1 - value)}</p>
            </div>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl h-40"></div>
            ))}
        </div>
    );
}