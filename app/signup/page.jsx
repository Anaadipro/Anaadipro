"use client";
import Link from "next/link";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Signup() {
    const [loginKey, setLoginKey] = useState(null); // holds dscode and password
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(3);
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        name: "",
        gender: "",
        mobileNo: "",
        password: "",
        group: "",
        pdscode: "",

        dob: "",
        fatherOrHusbandName: "",
        profession: "",
        maritalStatus: "",
        address: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            landmark: '',
            pinCode: '',
            state: '',
        }
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        const addressFields = ['addressLine1', 'addressLine2', 'city', 'landmark', 'pinCode', 'state'];

        if (addressFields.includes(name)) {
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [name]: value,
                },
            }));
            setErrors((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [name]: '',
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };



    const validateFields = () => {
        let newErrors = {};
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (step === 2 && !formData.otp.trim()) newErrors.otp = "OTP is required";
        if (step === 3) {
            if (!formData.name.trim()) newErrors.name = "Full Name is required";
            if (!formData.mobileNo.trim() || formData.mobileNo.length < 12)
                newErrors.mobileNo = "Enter a valid 10-digit mobile number";
            if (!formData.gender) newErrors.gender = "Please select a gender";
            if (!formData.group) newErrors.group = "Please select a Group";
            if (!formData.pdscode) newErrors.pdscode = "Please Enter Referral";

            if (!formData.dob) newErrors.dob = "Please enter Date of Birth";
            if (!formData.fatherOrHusbandName) newErrors.fatherOrHusbandName = "Please enter Father or Husband's Name";
            if (!formData.profession) newErrors.profession = "Please enter Profession";
            if (!formData.maritalStatus) newErrors.maritalStatus = "Please select Marital Status";
            if (!formData.address?.addressLine1) newErrors.addressLine1 = "Please enter Address Line 1";
            if (!formData.address?.addressLine2) newErrors.addressLine2 = "Please enter Address Line 2";
            if (!formData.address?.city) newErrors.city = "Please enter City";
            if (!formData.address?.landmark) newErrors.landmark = "Please enter Landmark";
            if (!formData.address?.pinCode) newErrors.pinCode = "Please enter Pin Code";
            if (!formData.address?.state) newErrors.state = "Please select State";

            if (!formData.password.trim()) newErrors.password = "Password is required";
            else if (formData.password.length < 6)
                newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;
        setIsSubmitting(true);
        try {
            const response = await axios.post("/api/otp", { email: formData.email });
            toast.success(response.data.message);
            setStep(2);
            setIsSubmitting(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;
        setIsSubmitting(true);
        try {
            const response = await axios.post("/api/otp", { email: formData.email, otp: formData.otp });
            toast.success(response.data.message);
            setIsSubmitting(false);
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;
        setIsSubmitting(true);
        try {
            const response = await axios.post("/api/user/create", formData);
            toast.success(response.data.message);
            setLoginKey({
                dscode: response.data.dscode,
                password: response.data.password,
            });
            setShowModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
            <Toaster />
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up relative overflow-hidden">

                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>

                        <div className="text-center mt-4">
                            <div className="flex justify-center mb-4">
                                <div className="bg-gradient-to-tr from-blue-100 to-purple-100 p-4 rounded-full shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M12 6.253v.01M19.428 15.341a8 8 0 11-14.856 0" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 You're Registered!</h2>
                            <p className="text-sm text-gray-500 mb-6">Keep these credentials safe — they’re your login keys.</p>

                            {/* DS Code */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-600">DS Code</p>
                                <div className="inline-block mt-2 px-5 py-2 text-blue-700 bg-blue-100 rounded-full font-semibold shadow-inner tracking-wide">
                                    {loginKey?.dscode}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-600">Password</p>
                                <div className="inline-block mt-2 px-5 py-2 text-red-700 bg-red-100 rounded-full font-semibold shadow-inner tracking-wide">
                                    {loginKey?.password}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    window.location.href = "/signin";
                                }}
                                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-center text-[#161950] mb-4">
                    {step === 1 ? "Verify Email" : step === 2 ? "Enter OTP" : "Create an Account"}
                </h2>
                <form onSubmit={step === 1 ? handleEmailSubmit : step === 2 ? handleOtpVerify : handleSubmit} className="grid lg:grid-cols-2 gap-2">
                    {step === 1 && (
                        <div className="lg:col-span-1">
                            <label className="text-gray-700 text-sm font-semibold">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} placeholder="Email Address" className="block w-full px-4 py-2 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                        </div>
                    )}
                    {step === 2 && (
                        <div className="lg:col-span-1">
                            <label className="text-gray-700 text-sm font-semibold">Enter OTP</label>
                            <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter OTP" className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                            {errors.otp && <p className="text-red-500 text-xs">{errors.otp}</p>}
                        </div>
                    )}
                    {step === 3 && (
                        <>
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            </div>
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Mobile No</label>
                                <PhoneInput country="in" disableDropdown={true} value={formData.mobileNo} onChange={(phone) => setFormData({ ...formData, mobileNo: phone })} inputStyle={{ width: "100%", height: "45px", borderColor: "lightgray" }} />
                                {errors.mobileNo && <p className="text-red-500 text-xs">{errors.mobileNo}</p>}
                            </div>

                            {/* Remove id use otp verify */}
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Email Id</label>
                                <input type="email" placeholder="example@gmail.com" name="email" value={formData.email} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>
                            {/*  */}


                            {/*  */}
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">DOB</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                                {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
                            </div>

                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Father Or HusbandName</label>
                                <input type="text" placeholder="Father Or HusbandName" name="fatherOrHusbandName" value={formData.fatherOrHusbandName} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                                {errors.fatherOrHusbandName && <p className="text-red-500 text-xs">{errors.fatherOrHusbandName}</p>}
                            </div>

                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">profession</label>
                                <select name="profession" value={formData.profession} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm">
                                    <option value="" disabled>Select</option>
                                    <option value="SALARIED">SALARIED</option>
                                    <option value="SELF-EMPLOYED">SELF-EMPLOYED</option>
                                    <option value="STUDENT">STUDENT</option>
                                    <option value="RETIRED">RETIRED</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                                {errors.profession && <p className="text-red-500 text-xs">{errors.profession}</p>}
                            </div>


                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Marital Status</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm">
                                    <option value="" disabled>Select</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                                {errors.maritalStatus && <p className="text-red-500 text-xs">{errors.maritalStatus}</p>}
                            </div>
                            {[
                                { label: 'Address Line 1', name: 'addressLine1' },
                                { label: 'Address Line 2', name: 'addressLine2' },
                                { label: 'City', name: 'city' },
                                { label: 'Landmark', name: 'landmark' },
                                { label: 'Pin Code', name: 'pinCode', type: 'number' },
                                { label: 'State', name: 'state' },
                            ].map(({ label, name, type = 'text' }) => (
                                <div key={name} className="lg:col-span-1">
                                    <label className="text-gray-700 text-sm font-semibold">{label}</label>
                                    <input
                                        type={type}
                                        name={name}
                                        placeholder={label}
                                        value={formData.address[name]}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm"
                                        required
                                    />
                                    {errors.address?.[name] && (
                                        <p className="text-red-500 text-xs">{errors.address[name]}</p>
                                    )}
                                </div>
                            ))}
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm">
                                    <option value="" disabled>Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
                            </div>
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Group</label>
                                <select name="group" value={formData.group} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm">
                                    <option value="" disabled>Select</option>
                                    <option value="SAO">SAO</option>
                                    <option value="SGO">SGO</option>
                                </select>
                                {errors.group && <p className="text-red-500 text-xs">{errors.group}</p>}
                            </div>
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Reference Ds Id.</label>
                                <input type="text" name="pdscode" value={formData.pdscode} onChange={handleChange} className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                                {errors.pdscode && <p className="text-red-500 text-xs">{errors.pdscode}</p>}
                            </div>
                            <div className="lg:col-span-1">
                                <label className="text-gray-700 text-sm font-semibold">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="block w-full px-4 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#161950] focus:outline-none focus:ring-[#161950] sm:text-sm" required />
                                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                            </div>
                        </>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full lg:col-span-2 cursor-pointer bg-[#161950]/80 text-white py-2 rounded-lg hover:bg-[#161950] transition disabled:bg-gray-400">
                        {isSubmitting ? "Processing..." : step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Sign Up"}
                    </button>
                    <Link href="/signin">
                        <p className="text-xs hover:underline hover:text-[#161950] font-semibold text-gray-600">Already have an account? Sign in</p>
                    </Link>
                </form>
            </div>
        </section>
    );
}
