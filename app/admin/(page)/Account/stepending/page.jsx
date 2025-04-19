"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import steppending from "@/constanst/StepPending";

export default function Page() {
  const { data: session } = useSession();
  const [userdata, setUserData] = useState({ saosp: "0.00", sgosp: "0.00" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;
      try {
        const response = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [session?.user?.email]);

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Step Pending</h2>
      <table className="min-w-full border border-gray-300 text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-3 text-center py-2">Step</th>
            <th className="border border-gray-300 px-3 text-center py-2">TotalSAOSP</th>
            <th className="border border-gray-300 px-3 text-center py-2">TotalSGOSP</th>
            <th className="border border-gray-300 px-3 text-center py-2">SAOSP</th>
            <th className="border border-gray-300 px-3 text-center py-2">SGOSP</th>
            <th className="border border-gray-300 px-3 text-center py-2">RemainSAOSP</th>
            <th className="border border-gray-300 px-3 text-center py-2">RemainSGOSP</th>
            <th className="border border-gray-300 px-3 text-center py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {steppending.map((data, index) => {
            const totalSAO = parseFloat(data.sao);
            const totalSGO = parseFloat(data.sgo);
            const userSAO = parseFloat(userdata.saosp || "0");
            const userSGO = parseFloat(userdata.sgosp || "0");

            const remainSAO = Math.max(totalSAO - userSAO, 0).toFixed(2);
            const remainSGO = Math.max(totalSGO - userSGO, 0).toFixed(2);

            const isComplete = remainSAO === "0.00" && remainSGO === "0.00";

            return (
              <tr key={index}>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{index + 1}</td>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{totalSAO.toFixed(2)}</td>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{totalSGO.toFixed(2)}</td>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{userSAO.toFixed(2)}</td>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{userSGO.toFixed(2)}</td>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{remainSAO}</td>
                <td className="border text-gray-600 text-center border-gray-300 px-3 py-2">{remainSGO}</td>
                <td className={`border border-gray-300 px-3 text-center py-2 font-medium ${isComplete ? "text-green-600" : "text-red-600"}`}>
                  {isComplete ? "Complete" : "Pending"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
