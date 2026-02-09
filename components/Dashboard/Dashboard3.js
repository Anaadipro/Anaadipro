"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Trophy, ArrowUpRight, FileText } from "lucide-react";

export default function Dashboard3() {
    const { data: session } = useSession();
    const [data, setData] = useState("");
    const [level, setLevel] = useState([]);
    const [nextLevelTarget, setNextLevelTarget] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setError("Failed to load data.");
                setLoading(false);
            }
        };
        fetchUserData();
    }, [session?.user?.email]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/level/fetch/level");
                const levelsData = response.data.data || [];
                setLevel(levelsData);

                // Find the user's current level object
                const currentLevel = levelsData.find(lvl => lvl.level_name === data?.level);

                if (currentLevel) {
                    // Convert sao values to numbers for comparison
                    const sortedLevels = levelsData
                        .map(lvl => ({ ...lvl, sao: Number(lvl.sao) })) // Ensure sao is numeric
                        .sort((a, b) => a.sao - b.sao); // Sort by sao value

                    // Find the next level with a higher sao
                    const nextLevel = sortedLevels.find(lvl => lvl.sao > currentLevel.sao);

                    if (nextLevel) {
                        const userSaosp = Number(data?.saosp) || 1; // Default to 1 to avoid division by zero
                        const nextSao = nextLevel.sao;

                        // Calculate ratio
                        const divisor = gcd(nextSao, userSaosp); // Get greatest common divisor
                        const ratio = `${nextSao / divisor}:${userSaosp / divisor}`;

                        setNextLevelTarget(ratio);
                    } else {
                        setNextLevelTarget("MAX");
                    }
                } else {
                    setNextLevelTarget("N/A");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [data?.level]);


    if (loading) return <SkeletonLoader />;
    if (error) return <p className="text-red-500 text-center font-semibold">{error}</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4  bg-gray-50 dark:bg-gray-900">


            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden">
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] from-purple-500`}></div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><Trophy className="text-purple-500" /></div>
                    <p className="text-gray-700 dark:text-white font-semibold">Trip Commission</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-300 mt-2">0.00</p>
            </div>


            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden">
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] from-red-500`}></div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><ArrowUpRight className="text-red-500" /></div>
                    <p className="text-gray-700 dark:text-white font-semibold">Current Level</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-300 mt-2">{data?.level ?? "N/A"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data?.level}.</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Level Next Target: {nextLevelTarget}</p>

            </div>

            <div className="relative p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border overflow-hidden">
                <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] from-purple-500`}></div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"><FileText className="text-gray-500" /></div>
                    <p className="text-gray-700 dark:text-white font-semibold">Bonanza Status</p>
                </div>
                <p className="text-xl font-bold text-red-500 dark:text-gray-300 mt-2">pending</p>
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
export function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}
