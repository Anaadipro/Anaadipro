'use client';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useSession } from "next-auth/react";

export default function Page() {
  const [data, setData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userdata, setUserdata] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
        setUserdata(res.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [session?.user?.email]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/3months/fetch/all');
        const json = await res.json();
        if (json.success) {
          setData(json.data[0] || null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const sameMonth = fromDate.getMonth() === toDate.getMonth();
    const sameYear = fromDate.getFullYear() === toDate.getFullYear();

    const options = { day: '2-digit', month: 'short' };
    const fromStr = fromDate.toLocaleDateString('en-GB', options);
    const toStr = toDate.toLocaleDateString('en-GB', options);

    return sameMonth && sameYear
      ? `${fromDate.getDate()} to ${toStr} ${toDate.getFullYear()}`
      : `${fromStr} to ${toStr} ${toDate.getFullYear()}`;
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEECE2] to-[#F7DED0] flex items-center justify-center p-6">
        <div className="text-2xl text-[#FFBE98] font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
        No Bonanza data found.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 ">
      <div className="w-full bg-white shadow-xl p-10 border border-gray-100 space-y-10 ">
        {/* Header */}
        <h1 className="text-5xl font-bold text-center text-gray-800 tracking-tight">
          Bonanza Pendency
        </h1>

        {/* Date Range and Title */}
        <div className="text-center bg-gradient-to-r from-[#FFEFE6] to-[#FFF7F0] text-gray-700 p-5  font-medium shadow-sm">
          {formatDateRange(data.datefrom, data.dateto)}
          <div className="text-2xl text-blue-800 mt-2 bg-white rounded p-2">{data.title}</div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base rounded-xl overflow-hidden">
            <thead className="bg-[#FFEFE6] text-gray-800">
              <tr>
                <th className="p-4 font-semibold tracking-wide">Type</th>
                <th className="p-4 font-semibold tracking-wide">Current</th>
                <th className="p-4 font-semibold tracking-wide">Target</th>
                <th className="p-4 font-semibold tracking-wide">Remain</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-t border-gray-100 hover:bg-[#FFF7F0] transition-all duration-300">
                <td className="p-4 font-medium">SAO SP</td>
                <td className="p-4">{userdata?.saosp || 0} SP</td>
                <td className="p-4">{data?.sao || 0} SP</td>
                <td className="p-4 text-rose-500 font-semibold">
                  {Math.max(0, (data?.sao || 0) - (userdata?.saosp || 0))} SP
                </td>
              </tr>
              <tr className="border-t border-gray-100 hover:bg-[#FFF7F0] transition-all duration-300">
                <td className="p-4 font-medium">SGO SP</td>
                <td className="p-4">{userdata?.sgosp || 0} SP</td>
                <td className="p-4">{data?.sgo || 0} SP</td>
                <td className="p-4 text-rose-500 font-semibold">
                  {Math.max(0, (data?.sgo || 0) - (userdata?.sgosp || 0))} SP
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
