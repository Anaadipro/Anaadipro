"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    image: "",
    productname: "",
    group: "",
    dp: "",
    sp: "",
    mrp: ""
  });

  const [productGroups, setProductGroups] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchProductGroups = async () => {
      setFetching(true);
      setFetchError("");
      try {
        const response = await axios.get("/api/Product/Group/fetch/s");
        setProductGroups(response.data.data || []);
      } catch (error) {
        setFetchError(error.response?.data?.message || "Failed to fetch product groups.");
      } finally {
        setFetching(false);
      }
    };
    fetchProductGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const imageData = new FormData();
    imageData.append("file", file);
    try {
      const response = await axios.post("/api/upload", imageData);
      setFormData({ ...formData, image: response.data.file.secure_url });
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.image.trim() &&
      formData.productname.trim() &&
      formData.group.trim() &&
      formData.dp.trim() &&
      formData.sp.trim() &&
      formData.mrp.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid() || loading) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/Product/Product/create", formData);
      setSuccess(response.data.message || "Product added successfully.");
      setFormData({ image: "", productname: "", sp: "", mrp: "", group: "", dp: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-200 text-center">Add Product</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}
      {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input type="text" name="productname" placeholder="Product Name" value={formData.productname} onChange={handleChange} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
        <select name="group" value={formData.group} onChange={handleChange} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required disabled={fetching || productGroups.length === 0}>
          <option value="">Select Group</option>
          {productGroups.map((group) => (<option key={group._id} value={group.groupname}>{group.groupname}</option>))}
        </select>
        <input type="number" name="sp" placeholder="Sp" value={formData.sp} onChange={handleChange} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
        <input type="number" name="dp" placeholder="Discount Price" value={formData.dp} onChange={handleChange} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
        <input type="number" name="mrp" placeholder="Market Price" value={formData.mrp} onChange={handleChange} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" required />
        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
        {uploading && <p className="text-blue-500 text-center">Uploading image...</p>}
        {formData.image && <img src={formData.image} alt="Uploaded Preview" className="w-32 h-32 object-cover rounded mx-auto" />}
        <button type="submit" disabled={!isFormValid() || loading} className={`w-full p-3 text-white font-semibold rounded transition ${(!isFormValid() || loading) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}