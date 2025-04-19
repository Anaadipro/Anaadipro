"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function NomineeDetails() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session, update } = useSession();
    const [data, setData] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nomineeName: "",
        nomineeRelation: "",
        nomineeDOB: "",
        nomineebankName: "",
        nomineeacnumber: "",
        nomineeifscCode: "",
        nomineeipanno: "",
        nomineeiaadharno: ""
    });

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            if (!session?.user?.email) return;
            try {
                const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
                if (response.data?._id) {
                    setData(response.data); // Store full user data

                    setFormData({
                        nomineeName: response.data.nomineeName || "",
                        nomineeRelation: response.data.nomineeRelation || "",
                        nomineeDOB: response.data.nomineeDOB || "",
                        nomineebankName: response.data.nomineebankName || "",
                        nomineeacnumber: response.data.nomineeacnumber || "",
                        nomineeifscCode: response.data.nomineeifscCode || "",
                        nomineeipanno: response.data.nomineeipanno || "",
                        nomineeiaadharno: response.data.nomineeiaadharno || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setFetching(false);
                setLoading(false);

            }
        };
        fetchUserData();
    }, [session?.user?.email]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!data?._id) return;
        setLoading(true);

        try {
            const response = await axios.patch("/api/user/update-user", {
                id: data._id, // Use user ID
                ...formData, // Ensure correct format
            });

            if (response.data.success) {
                alert("User updated successfully");
                setIsModalOpen(false);
                update(); // Refresh session manually if needed
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to update user:", error);
            alert("Failed to update user");
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <>
                <div className="text-center text-gray-500 h-8 rounded bg-gray-200 border animate-pulse"></div>
                <div className="text-center text-gray-500 h-8 rounded bg-gray-200 border animate-pulse"></div>
                <div className="text-center text-gray-500 h-8 rounded bg-gray-200 border animate-pulse"></div>
                <div className="text-center text-gray-500 h-8 rounded bg-gray-200 border animate-pulse"></div>
            </>
        );
    }
    return (
        <div>
            <div className="p-5 border border-gray-200 rounded dark:border-gray-200 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="w-full space-y-8">

{/* Nominee Details */}
<div>
  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Co-Applicant's/Nominee Details</h4>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:gap-x-10 mt-4">
    {[
      { label: "Nominee Name", value: data?.nomineeName },
      { label: "Relation", value: data?.nomineeRelation },
      {
        label: "DOB",
        value: data?.nomineeDOB
          ? new Date(data.nomineeDOB).toLocaleDateString("en-GB")
          : "Not Provided",
      },
    ].map((item, index) => (
      <div
        key={index}
        className="px-4 py-3 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10"
      >
        <p className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-300">{item.label}</p>
        <p className="text-sm text-gray-800 dark:text-white">{item.value || "Not Provided"}</p>
      </div>
    ))}
  </div>
</div>

{/* Payment Details */}
<div>
  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Payment Details</h4>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:gap-x-10 mt-4">
    {[
      { label: "Bank Name", value: data?.nomineebankName },
      { label: "Account No", value: data?.nomineeacnumber },
      { label: "IFSC Code", value: data?.nomineeifscCode },
    ].map((item, index) => (
      <div
        key={index}
        className="px-4 py-3 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10"
      >
        <p className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-300">{item.label}</p>
        <p className="text-sm text-gray-800 dark:text-white">{item.value || "Not Provided"}</p>
      </div>
    ))}
  </div>
</div>

{/* KYC Details */}
<div>
  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">KYC Details</h4>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:gap-x-10 mt-4">
    {[
      { label: "PAN No", value: data?.nomineeipanno },
      { label: "Aadhar No", value: data?.nomineeiaadharno },
    ].map((item, index) => (
      <div
        key={index}
        className="px-4 py-3 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10"
      >
        <p className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-300">{item.label}</p>
        <p className="text-sm text-gray-800 dark:text-white">{item.value || "Not Provided"}</p>
      </div>
    ))}
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


                {isModalOpen && (
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            className="relative max-w-xl w-full bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-500"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
                            <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white text-center">
                                Edit Nominee Information
                            </h4>
                            <form className="flex flex-col" onSubmit={handleUpdate}>
                                <div className="overflow-y-auto px-2 pb-3">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 text-gray-800 dark:text-white/90">
                                        {[
                                            { label: "Nominee Name", name: "nomineeName", type: "text" },
                                            { label: "Relation", name: "nomineeRelation", type: "select", options: ["Brother", "Father", "Friend", "Mother", "Wife", "Sister"] },
                                            { label: "DOB", name: "nomineeDOB", type: "date" },
                                            { label: "Bank Name", name: "nomineebankName", type: "text" },
                                            { label: "Account No", name: "nomineeacnumber", type: "number" },
                                            { label: "IFSC Code", name: "nomineeifscCode", type: "text" },
                                            { label: "Pan No", name: "nomineeipanno", type: "text" },
                                            { label: "Addhar No.", name: "nomineeiaadharno", type: "number" },
                                        ].map((field) => (
                                            <div key={field.name}>
                                                <label className="block text-gray-700 dark:text-gray-300 font-medium">
                                                    {field.label}
                                                </label>
                                                {field.type === "select" ? (
                                                    <select
                                                        name={field.name}
                                                        value={formData[field.name]}
                                                        onChange={handleChange}
                                                        className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm"
                                                    >
                                                        <option value="">Select {field.label}</option>
                                                        {field.options.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        name={field.name}
                                                        value={formData[field.name]}
                                                        onChange={handleChange}
                                                        className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm"
                                                        type={field.type}
                                                        placeholder={field.label}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
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
            </div>


        </div>
    );
}
