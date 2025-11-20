import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EquipmentList = () => {
    const [equipment, setEquipment] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/equipment', {
                    headers: { 'auth-token': token }
                });
                setEquipment(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEquipment();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/equipment/${id}`, {
                    headers: { 'auth-token': token }
                });
                setEquipment(equipment.filter(item => item._id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="equipment-list">
            <h3>Equipment Inventory</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Serial Number</th>
                        <th>Status</th>
                        <th>Next Calibration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {equipment.map(item => (
                        <tr key={item._id}>
                            <td>{item.name}</td>
                            <td>{item.serialNumber}</td>
                            <td>{item.status}</td>
                            <td>{new Date(item.nextCalibrationDate).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => navigate(`/edit-equipment/${item._id}`)}>Edit</button>
                                <button onClick={() => navigate(`/record-calibration/${item._id}`)}>Calibrate</button>
                                {(user.role === 'Admin' || user.role === 'Manager') && (
                                    <button onClick={() => handleDelete(item._id)}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EquipmentList;
