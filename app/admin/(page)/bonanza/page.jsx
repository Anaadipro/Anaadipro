'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export default function BonanzaPage() {
  const { data: session } = useSession();
  const [userds, setUserds] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [userdata, setUserdata] = useState(null);
  const [bonanzaData, setBonanzaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // 1️⃣ Fetch user details by email
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`/api/user/find-admin-byemail/${session.user.email}`);
        const user = res.data;
        setUserds(user.dscode);
        setUserLevel(user.level);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserDetails();
  }, [session?.user?.email]);

  // 2️⃣ Fetch user SP stats
  useEffect(() => {
    if (!userds) return;

    const fetchSPData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/dashboard/teamsp/${userds}`);
        setUserdata(res.data);
      } catch (err) {
        console.error('Error fetching SP data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSPData();
  }, [userds]);

  // 3️⃣ Fetch bonanza data
  useEffect(() => {
    if (!userds) return;

    const fetchBonanzaData = async () => {
      try {
        const res = await fetch(`/api/3months/findds/${userds}`);
        const json = await res.json();
        if (json.success) {
          setBonanzaData(json.data[0] || null);
        }
      } catch (err) {
        console.error('Error fetching bonanza data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBonanzaData();
  }, [userds]);

  // 4️⃣ Utility: Format date range
  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const options = { day: '2-digit', month: 'short' };
    const fromStr = fromDate.toLocaleDateString('en-GB', options);
    const toStr = toDate.toLocaleDateString('en-GB', options);

    return fromDate.getMonth() === toDate.getMonth() && fromDate.getFullYear() === toDate.getFullYear()
      ? `${fromDate.getDate()} to ${toStr} ${toDate.getFullYear()}`
      : `${fromStr} to ${toStr} ${toDate.getFullYear()}`;
  };

  // 5️⃣ Loading state
  if (initialLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEECE2] to-[#F7DED0] flex items-center justify-center">
        <div className="text-xl sm:text-2xl text-[#FFBE98] font-semibold animate-pulse">Loading Bonanza Data...</div>
      </div>
    );
  }

  // 6️⃣ No bonanza data found
  if (!bonanzaData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-lg sm:text-xl text-gray-500">
        No Bonanza data found for your account.
      </div>
    );
  }

  // 7️⃣ Get level-specific targets
  const levelInfo = bonanzaData?.levels?.find(
    (lvl) => lvl.level?.toUpperCase() === userLevel?.toUpperCase()
  );

  const baseSAO = bonanzaData?.UserDetails?.[0]?.saosp || 0;
  const baseSGO = bonanzaData?.UserDetails?.[0]?.sgosp || 0;

  const userSAO = userdata?.totalSaoSP ?? userdata?.totalSAOsp ?? 0;
  const userSGO = userdata?.totalSgoSP ?? userdata?.totalSGOsp ?? 0;

  const targetSAO = parseInt(levelInfo?.sao || '0', 10);
  const targetSGO = parseInt(levelInfo?.sgo || '0', 10);

  const currentSAO = userSAO - baseSAO;
  const currentSGO = userSGO - baseSGO;

  const remainSAO = Math.max(0, targetSAO - currentSAO);
  const remainSGO = Math.max(0, targetSGO - currentSGO);

  const allAchieved = remainSAO === 0 && remainSGO === 0;

  // ✅ 8️⃣ Render Page
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7F0] to-[#FFF2E6] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-6 sm:p-10 space-y-8">
        <h1 className="text-3xl sm:text-5xl font-bold text-center text-[#333]">
          Bonanza Pendency
        </h1>

        <div className="text-center">
          <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-lg sm:text-xl font-semibold shadow-sm">
            {formatDateRange(bonanzaData.datefrom, bonanzaData.dateto)}
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-800">{bonanzaData.title}</div>
        </div>

        {allAchieved && (
          <div className="bg-green-100 text-green-800 p-4 text-center text-lg sm:text-2xl font-semibold rounded-lg shadow-sm">
            🎉 Congratulations! You have achieved  targets! 🎯
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm sm:text-base">
            <thead className="bg-[#FFEFE6] text-gray-800">
              <tr>
                <th className="p-3 sm:p-4 text-left">Type</th>
                <th className="p-3 sm:p-4 text-left">Current Achieve</th>
                <th className="p-3 sm:p-4 text-left">Target</th>
                <th className="p-3 sm:p-4 text-left">Remaining</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {['SAO', 'SGO'].map((type) => {
                const baseSP = type === 'SAO' ? baseSAO : baseSGO;
                const userSP = type === 'SAO' ? userSAO : userSGO;
                const current = userSP - baseSP;
                const target = type === 'SAO' ? targetSAO : targetSGO;
                const remain = Math.max(0, target - current);

                return (
                  <tr key={type} className="border-t border-gray-100 hover:bg-[#FFF7F0]">
                    <td className="p-3 sm:p-4 font-medium">{type} SP</td>
                    <td className="p-3 sm:p-4">{current}</td>
                    <td className="p-3 sm:p-4">{target}</td>
                    <td className={`p-3 sm:p-4 font-semibold ${remain === 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {remain} SP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
