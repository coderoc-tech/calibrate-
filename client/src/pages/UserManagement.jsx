import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import SuccessNotification from '../components/SuccessNotification';
import { FaUser, FaPlus, FaEdit, FaTrash, FaUserShield, FaUserTie, FaUserAlt } from 'react-icons/fa';

const UserManagement = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'User'
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
        // Check if user has permission to view this page
        if (!loading && user && user.role !== 'Admin' && user.role !== 'Manager') {
            navigate('/');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/users', {
                headers: { 'auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users', err);
            setError(err.response?.data?.message || 'Error fetching users');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);
        console.log('Submitting user form:', formData);
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'exists' : 'missing');
            if (editingUser) {
                // Update user
                const response = await axios.put(`/users/${editingUser._id}`, formData, {
                    headers: { 'auth-token': token }
                });
                console.log('User updated:', response.data);
                setSuccessMessage(`User "${formData.username}" updated successfully!`);
            } else {
                // Create user
                const response = await axios.post('/users', formData, {
                    headers: { 'auth-token': token }
                });
                console.log('User created:', response.data);
                setSuccessMessage(`User "${formData.username}" created successfully!`);
            }
            setShowAddUser(false);
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role: 'User' });
            fetchUsers();
        } catch (err) {
            console.error('Error saving user:', err);
            console.error('Error response:', err.response);
            const errorMsg = err.response?.data?.message || 'Error saving user';

            // Provide helpful error message for authorization issues
            if (err.response?.status === 403) {
                setError(`${errorMsg}. Please log out and log back in to refresh your session.`);
            } else {
                setError(errorMsg);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (userToEdit) => {
        setEditingUser(userToEdit);
        setFormData({
            username: userToEdit.username,
            email: userToEdit.email,
            password: '',
            role: userToEdit.role
        });
        setShowAddUser(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/users/${userId}`, {
                headers: { 'auth-token': token }
            });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting user');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin':
                return <FaUserShield style={{ color: '#ef4444' }} />;
            case 'Manager':
                return <FaUserTie style={{ color: '#f59e0b' }} />;
            default:
                return <FaUserAlt style={{ color: '#3b82f6' }} />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin':
                return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' };
            case 'Manager':
                return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b' };
            default:
                return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6' };
        }
    };

    if (loading || !user) return null;

    const isAdmin = user.role === 'Admin';

    return (
        <Layout>
            <div className="user-management-container">
                {successMessage && (
                    <SuccessNotification
                        message={successMessage}
                        onClose={() => setSuccessMessage('')}
                    />
                )}

                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>
                            <FaUser style={{ marginRight: '0.5rem' }} />
                            User Management
                        </h1>
                        <p className="text-muted">Manage users and assign roles in your organization.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setShowAddUser(true);
                                setEditingUser(null);
                                setFormData({ username: '', email: '', password: '', role: 'User' });
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FaPlus /> Add User
                        </button>
                    )}
                </div>

                {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

                {/* Add/Edit User Form */}
                {showAddUser && isAdmin && (
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                            <input
                                name="username"
                                value={formData.username}
                                placeholder="Username"
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                placeholder="Email"
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                placeholder={editingUser ? "Password (leave blank to keep current)" : "Password"}
                                onChange={handleChange}
                                required={!editingUser}
                            />
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="User">User</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddUser(false);
                                        setEditingUser(null);
                                        setError('');
                                    }}
                                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Users List */}
                {isLoadingData ? (
                    <p>Loading users...</p>
                ) : (
                    <div className="equipment-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Created Date</th>
                                    {isAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                {getRoleIcon(u.role)}
                                                <span style={{
                                                    ...getRoleBadgeColor(u.role),
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        {isAdmin && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            backgroundColor: 'transparent',
                                                            border: '1px solid var(--border)',
                                                            color: 'var(--text-main)',
                                                            cursor: 'pointer',
                                                            borderRadius: '0.5rem'
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u._id)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            backgroundColor: 'transparent',
                                                            border: '1px solid var(--border)',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            borderRadius: '0.5rem'
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default UserManagement;
