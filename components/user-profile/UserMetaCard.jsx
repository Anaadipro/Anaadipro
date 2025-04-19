"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import Active from "../Active/Active";

export default function UserMetaCard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session, update } = useSession();
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                if (response.data?.name) {
                    setData(response.data);
                    setName(response.data.name);
                }
            } catch (error) {
                console.error("Failed to fetch user name:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchUserData();
    }, [session?.user?.email]);


    const userRole = useMemo(() => {
        return { "0": "User", "1": "Admin", "2": "Superadmin" }[session?.user?.usertype] || "";
    }, [session?.user?.usertype]);


    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await axios.post("/api/upload", formData);
            return response.data.file.secure_url;
        } catch (error) {
            console.error("Image upload failed:", error);
            return null;
        }
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        let imageUrl = data?.image || "";

        if (image) {
            const uploadedImage = await handleImageUpload(image);
            if (uploadedImage) imageUrl = uploadedImage;
        }

        try {
            const response = await axios.patch("/api/user/update-user", {
                id: session?.user?.id,
                name,
                image: imageUrl,
            });

            if (response.data.success) {

                await update({
                    ...session,
                    user: { ...session.user, name, image: imageUrl },
                });


                const updatedUser = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                setData(updatedUser.data);
                setName(updatedUser.data.name);
                window.location.reload();

                setImage(null);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="p-5 border border-gray-200 rounded dark:border-gray-200 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">

                        <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                            <Image
                                width={80}
                                height={80}
                                src={data?.image || "/images/user/icon-5359553_640.webp"}
                                alt="User"
                                className="object-cover w-full h-full"
                            />
                        </div>


                        <div className="order-3 xl:order-2 bg-white dark:bg-gray-800">
                            <h4 className="mb-3 text-xl font-semibold text-center xl:text-left text-gray-900 dark:text-white">
                                {fetching ? "Loading..." : data?.name || "Unknown"}
                            </h4>
                            <div className="flex gap-4 flex-wrap items-center justify-center xl:justify-start space-x-3">
                                <div>
                                    <h2 className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium px-3 py-1 rounded text-sm shadow">
                                        DsId : {data?.dscode}
                                    </h2>
                                </div>
                                <div>
                                    <h2 className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium px-3 py-1 rounded text-sm shadow">
                                        Sponsor DSID : {data?.pdscode}
                                    </h2>
                                </div>
                                <div>
                                    <h2 className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium px-3 py-1 rounded text-sm shadow">
                                        Sponsor DS Name : {data?.name}
                                    </h2>
                                </div>
                                <div
                                    className={`px-3 py-1 rounded text-sm font-medium shadow-md ${data?.kycVerification?.isVerified
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                        }`}
                                >
                                    KYC = {data?.kycVerification?.isVerified ? "DONE" : "PENDING"}
                                </div>

                                {data?.kycVerification?.isVerified && data?.usertype !== "1" && (
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium shadow-md"
                                    >
                                        Active
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>


                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white px-4 py-1 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                    >
                        Edit
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative max-w-lg w-full bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-6 lg:p-10"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-500"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>


                        <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white text-center">
                            Upload Profile Image
                        </h4>


                        <form className="flex flex-col space-y-4" onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 font-medium">Upload Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />
                                </div>
                            </div>


                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#161950]/80 text-white px-4 py-2 rounded-lg hover:bg-[#161950] transition disabled:bg-gray-400"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {showModal && (
                <div className="fixed inset-0 z-50 bg-white">
                    <div className=" flex justify-end p-2"><button
                        className="px-4 py-1 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button></div>
                    <div className=" flex justify-center p-2">

                        <Active userData={data} />
                    </div>
                </div>
            )}
        </div>
    );
}
