"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function TripBonanzaUpload() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get("/api/dashboardimage/fetch/s");
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("/api/upload", formData);
      return response.data.file.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!file) {
      alert("Please Select Image");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        await axios.post("/api/dashboardimage/create", { image: imageUrl });
        setFile(null);
        setImage(null);
        fetchImages();
      }
    } catch (error) {
      console.error("Failed to update image details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageUrl) => {
    setDeleting(true);
    try {
      await axios.delete("/api/dashboardimage/delete", { data: { image: imageUrl } });
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow w-full">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Bonanza</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-3 w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {image && (
          <div className="mt-3">
            <img src={image} alt="Preview" className="w-full rounded-md shadow-md" />
          </div>
        )}
        <button
          onClick={handleSave}
          className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
          disabled={!file || uploading || loading}
        >
          {loading || uploading ? "Uploading..." : "Submit"}
        </button>
      </div>

      <div className="mt-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Uploaded Images</h2>
        <div className="grid grid-cols-3 gap-2">
          {images.length > 0 ? (
            images.map((img, index) => (
              <div key={index} className="relative bg-white dark:bg-gray-800 p-1 rounded-lg shadow">
                <img src={img.image} alt={`Uploaded ${index}`} className="w-full rounded-md" />
                <button
                  onClick={() => handleDelete(img.image)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                  disabled={deleting}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center">No images found.</p>
          )}
        </div>
      </div>
    </div>
  );
}