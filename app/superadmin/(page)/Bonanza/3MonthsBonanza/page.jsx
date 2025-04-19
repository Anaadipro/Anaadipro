'use client';
import React, { useEffect, useState } from 'react';

export default function ThreeMonthsBonanza() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    title: '',
    sao: '',
    sgo: '',
    datefrom: '',
    dateto: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/3months/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        setForm({ title: '', sao: '', sgo: '', datefrom: '', dateto: '' });
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
  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const sameYear = fromDate.getFullYear() === toDate.getFullYear();
    const sameMonth = fromDate.getMonth() === toDate.getMonth();

    const options = { day: '2-digit', month: 'short' };
    const fromStr = fromDate.toLocaleDateString('en-GB', options);
    const toStr = toDate.toLocaleDateString('en-GB', options);
    const year = toDate.getFullYear();

    if (sameMonth) {
      return `${fromDate.getDate()} to ${toStr} ${year}`;
    }

    return `${fromStr} to ${toStr} ${year}`;
  };
  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 shadow-xl border border-orange-300">
      <h2 className="text-4xl font-extrabold  mb-8 text-orange-800">
        🎉 3 Months Bonanza
      </h2>

      {initialLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
        </div>
      ) : data ? (
        <div className="text-center space-y-4 text-lg text-gray-700 font-medium">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>SAO:</strong> {data.sao}</p>
          <p><strong>SGO:</strong> {data.sgo}</p>
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
          {[
            { name: 'title', placeholder: 'Enter Bonanza Title' },
            { name: 'sao', placeholder: 'Enter SAO' },
            { name: 'sgo', placeholder: 'Enter SGO' },
          ].map((field) => (
            <input
              key={field.name}
              type="text"
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
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
