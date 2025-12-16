import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { FaTrash } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

    setDeleting(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`User "${userName}" deleted successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <div className="text-sm text-gray-600">
          Total Users: <span className="font-semibold">{users.length}</span>
        </div>
      </div>
      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 text-sm mt-2">Users will appear here once they register</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="text-gray-400 p-2" title="Cannot delete admin user">
                          <FaTrash />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={deleting === user._id}
                          className={`p-2 rounded transition-colors ${
                            deleting === user._id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          }`}
                          title={deleting === user._id ? 'Deleting...' : 'Delete User'}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

