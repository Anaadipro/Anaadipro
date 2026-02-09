"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Printer } from "lucide-react";
import { useSession } from "next-auth/react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import Image from "next/image";
export default function page() {
    const [data, setData] = useState(null);
    const [fetching, setFetching] = useState(true);
    const { data: session, update } = useSession();
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });


    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                if (response.data?.name) {
                    setData(response.data);

                }
            } catch (error) {
                console.error("Failed to fetch user name:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchUserData();
    }, [session?.user?.email]);
    return (
        <>
            <div className="flex justify-start bg-white dark:bg-gray-900 p-6">
                <button
                    onClick={() => reactToPrintFn()}
                    className="flex items-center justify-center w-36 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 print:hidden"
                >
                    <Printer className="w-5 h-5 mr-2" />
                    Print ID Card
                </button>
            </div>

            <div ref={contentRef} className="flex flex-col items-center min-h-screen p-6 ">
                <div className="relative w-[350px] md:w-[400px] border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 print:p-4">

                    {/* Company Header */}
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                            ANAADIPRO Wellness Pvt. Ltd.
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reg. No: {data?._id}</p>
                    </div>

                    {/* Top Border */}
                    <div className="border-t my-4 border-gray-300 dark:border-gray-600"></div>

                    {/* Profile Section */}
                    <div className="flex justify-between text-sm text-gray-800 dark:text-white">
                        {/* Info */}
                        <div className="w-2/3 space-y-2">
                            <p><span className="font-semibold">Name:</span> {data?.name}</p>
                            <p><span className="font-semibold">Address:</span> {data?.address?.addressLine1}</p>
                            <p><span className="font-semibold">Mobile No:</span> {data?.mobileNo}</p>
                            <p>
                                <span className="font-semibold">DS Code:</span>{" "}
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-xs font-medium">
                                    {data?.dscode}
                                </span>
                            </p>
                        </div>

                        {/* Image */}
                        <div className="w-1/3 flex justify-center items-start">
                            <Image
                                width={80}
                                height={80}
                                src={data?.image || "/images/user/icon-5359553_640.webp"}
                                alt="User"
                                className=" border border-gray-400 object-cover shadow-md"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t my-4 border-gray-300 dark:border-gray-600"></div>

                    {/* Terms */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                        <strong>Terms & Conditions:</strong> The Direct Seller is not authorized to collect any cheques, demand drafts, or cash in their name from the customer.
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center text-[11px] text-gray-600 dark:text-gray-400 space-y-0.5">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Registered Office</p>
                        <p>Hore Chandra Nagar, DTR P9, Noel School, Gird, Gwalior Fort, Gwalior</p>
                        <p>Website: <span className="text-blue-600 dark:text-blue-400">www.anaadiprowellness.com</span></p>
                        <p>Contact: +91 11 28031568 | info@anaadiprowellness.com</p>
                    </div>
                </div>
            </div>

        </>
    );
}
