'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ThreeMonthsBonanza() {
  const [data, setData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [form, setForm] = useState({
    title: '',
    levelsData: [],  // Array of { level: string, sao: string, sgo: string }
    datefrom: '',
    dateto: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch existing bonanza data
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

  // Fetch levels from API
  const fetchLevels = async () => {
    try {
      const response = await axios.get('/api/level/fetch/level');
      const fetchedLevels = response.data.data || [];

      // Sort levels by 'sao' ascending if you want less 'sao' to mean less level
      fetchedLevels.sort((a, b) => Number(a.sao) - Number(b.sao));

      setLevels(fetchedLevels);

      // Initialize form.levelsData with fetched levels (empty sao, sgo values or defaults)
      setForm((prev) => ({
        ...prev,
        levelsData: fetchedLevels.map(lvl => ({
          level: lvl.level_name,
          sao: lvl.sao || '',
          sgo: lvl.sgo || ''
        }))
      }));
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLevels();
  }, []);

  // Handle change on title, datefrom, dateto inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle change on dynamic levels' sao and sgo inputs
  const handleLevelChange = (index, field, value) => {
    const updatedLevels = [...form.levelsData];
    updatedLevels[index][field] = value;
    setForm({ ...form, levelsData: updatedLevels });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/3months/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          levels: form.levelsData,
          datefrom: form.datefrom,
          dateto: form.dateto
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        setForm({
          title: '',
          levelsData: levels.map(lvl => ({
            level: lvl.level_name,
            sao: lvl.sao || '',
            sgo: lvl.sgo || ''
          })),
          datefrom: '',
          dateto: ''
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!data?._id) return;
    try {
      const res = await fetch(`/api/3months/delete/${data._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setData(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 shadow-xl border border-orange-300">
      <h2 className="text-4xl font-extrabold mb-8 text-orange-800">
        🎉 3 Months Bonanza
      </h2>

      {initialLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
        </div>
      ) : data ? (
        <div className="text-center space-y-4 text-lg text-gray-700 font-medium">
          <p><strong>Title:</strong> {data.title}</p>
          {/* Show all levels with their sao and sgo */}
          {data.levels.map((lvl, idx) => (
            <p key={idx}>
              <strong>Level {lvl.level} - SAO:</strong> {lvl.sao} | <strong>SGO:</strong> {lvl.sgo}
            </p>
          ))}
          <p><strong>Date From:</strong> {data.datefrom}</p>
          <p><strong>Date To:</strong> {data.dateto}</p>
          <button
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition"
            onClick={handleDelete}
          >
            Delete Bonanza
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter Bonanza Title"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          {/* Dynamically render levels inputs */}
          {levels.map((lvl, index) => (
            <div key={lvl.level_name} className="space-y-2 p-4 border rounded-md bg-white">
              <h4 className="font-semibold text-orange-700">{lvl.level_name}</h4>

              <input
                type="number"
                name={`sao-${index}`}
                value={form.levelsData[index]?.sao || ''}
                onChange={(e) => handleLevelChange(index, 'sao', e.target.value)}
                placeholder={`Enter SAO for ${lvl.level_name}`}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="number"
                name={`sgo-${index}`}
                value={form.levelsData[index]?.sgo || ''}
                onChange={(e) => handleLevelChange(index, 'sgo', e.target.value)}
                placeholder={`Enter SGO for ${lvl.level_name}`}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
          ))}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Date From</label>
              <input
                type="date"
                name="datefrom"
                value={form.datefrom}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Date To</label>
              <input
                type="date"
                name="dateto"
                value={form.dateto}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-3 rounded-full transition"
            disabled={loading}
          >
            {loading ? 'Saving Bonanza...' : 'Create Bonanza'}
          </button>
        </form>
      )}
    </div>
  );
}
