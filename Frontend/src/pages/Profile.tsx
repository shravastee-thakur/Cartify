import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import axios from "axios";
import toast from "react-hot-toast";

// Define user profile type
interface UserProfile {
  name: string;
  phoneNumber: string;
  address: string;
  city: string;
  pinCode: string;
}

type Tab = "profile" | "orders";

const ProfilePage: React.FC = () => {
  const { user, accessToken } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    phoneNumber: "",
    address: "",
    city: "",
    pinCode: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/user/getUser",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        setFormData({
          name: res.data.user.name || "",
          phoneNumber: res.data.user.phoneNumber || "",
          address: res.data.user.address || "",
          city: res.data.user.city || "",
          pinCode: res.data.user.pinCode || "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put(
        "http://localhost:3000/api/v1/user/updateUser",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(res.data);
      if (res.data.success) {
        toast(res.data.message, {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        setFormData(formData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium text-lg ${
              activeTab === "profile"
                ? "text-[#FA812F] border-b-2 border-[#FA812F]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`py-3 px-6 font-medium text-lg ${
              activeTab === "orders"
                ? "text-[#FA812F] border-b-2 border-[#FA812F]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="bg-white mx-auto max-w-xl shadow-xl rounded-lg overflow-hidden">
            <div className="bg-[#FA812F] p-5 text-white">
              <h2 className="text-xl md:text-2xl font-bold text-center">
                My Profile
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="pinCode"
                    className="block text-gray-700 text-sm font-medium mb-1"
                  >
                    Pin Code
                  </label>
                  <input
                    type="text"
                    id="pinCode"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-[#FA812F] hover:bg-[#e06a1a] text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:ring-offset-2"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="bg-[#FA812F] p-5 text-white">
              <h2 className="text-xl md:text-2xl font-bold text-center">
                My Orders
              </h2>
            </div>
            <div className="p-5 md:p-6 text-center">
              <p className="text-gray-600">
                Your order history will appear here soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
