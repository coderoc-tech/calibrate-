import { useState, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const AddEquipment = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        serialNumber: '',
        modelNumber: '',
        manufacturer: '',
        location: '',
        status: 'Active',
        nextCalibrationDate: '',
        calibrationFrequencyInMonths: 12
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/equipment', { ...formData, assignedTo: user._id }, {
                headers: { 'auth-token': token }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding equipment');
        }
    };

    return (
        <Layout>
            <div className="add-equipment-container">
                <h2>Add New Equipment</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Equipment Name" onChange={handleChange} required />
                    <input name="serialNumber" placeholder="Serial Number" onChange={handleChange} required />
                    <input name="modelNumber" placeholder="Model Number" onChange={handleChange} />
                    <input name="manufacturer" placeholder="Manufacturer" onChange={handleChange} />
                    <input name="location" placeholder="Location" onChange={handleChange} />

                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Reserve">Reserve</option>
                        <option value="Out for Calibration">Out for Calibration</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Discontinued">Discontinued</option>
                    </select>

                    <label>Next Calibration Date:</label>
                    <input type="date" name="nextCalibrationDate" onChange={handleChange} />

                    <label>Calibration Frequency (Months):</label>
                    <input type="number" name="calibrationFrequencyInMonths" value={formData.calibrationFrequencyInMonths} onChange={handleChange} />

                    <button type="submit">Add Equipment</button>
                </form>
            </div>
        </Layout>
    );
};

export default AddEquipment;
