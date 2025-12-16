import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user, loadUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    addresses: []
  });
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        addresses: user.addresses || []
      });
    }
  }, [user]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      // This would typically be an API call to update user addresses
      toast.success('Address added successfully');
      setNewAddress({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      loadUser();
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Addresses</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Address"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="mr-2"
                />
                Set as default address
              </label>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Add Address
              </button>
            </form>
          </div>

          {formData.addresses.length > 0 && (
            <div className="space-y-2">
              {formData.addresses.map((addr, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                    </div>
                    {addr.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Default</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

