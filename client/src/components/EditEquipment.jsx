import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import CalibrationHistory from './CalibrationHistory';
import Layout from './Layout';
import FileUpload from './FileUpload';

const EditEquipment = () => {
    const { id } = useParams();
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
        calibrationFrequencyInMonths: 12,
        documents: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/equipment/${id}`, {
                    headers: { 'auth-token': token }
                });
                // Format date for input field
                const data = res.data;
                if (data.nextCalibrationDate) {
                    data.nextCalibrationDate = new Date(data.nextCalibrationDate).toISOString().split('T')[0];
                }
                if (data.calibrationSentDate) {
                    data.calibrationSentDate = new Date(data.calibrationSentDate).toISOString().split('T')[0];
                }
                if (data.calibrationReturnDate) {
                    data.calibrationReturnDate = new Date(data.calibrationReturnDate).toISOString().split('T')[0];
                }
                setFormData(data);
            } catch (err) {
                setError('Error fetching equipment details');
            }
        };
        fetchEquipment();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/equipment/${id}`, formData, {
                headers: { 'auth-token': token }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating equipment');
        }
    };

    const handleUploadSuccess = async (fileData) => {
        // Update equipment with new document
        try {
            const token = localStorage.getItem('token');
            const updatedDocuments = [...(formData.documents || []), {
                name: fileData.fileName,
                filePath: fileData.filePath
            }];

            await axios.put(`/equipment/${id}`, { ...formData, documents: updatedDocuments }, {
                headers: { 'auth-token': token }
            });

            setFormData(prev => ({ ...prev, documents: updatedDocuments }));
        } catch (err) {
            console.error('Error updating equipment documents', err);
        }
    };

    return (
        <Layout>
            <div className="add-equipment-container">
                <h2>Edit Equipment</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input name="name" value={formData.name} placeholder="Equipment Name" onChange={handleChange} required />
                    <input name="serialNumber" value={formData.serialNumber} placeholder="Serial Number" onChange={handleChange} required />
                    <input name="modelNumber" value={formData.modelNumber} placeholder="Model Number" onChange={handleChange} />
                    <input name="manufacturer" value={formData.manufacturer} placeholder="Manufacturer" onChange={handleChange} />
                    <input name="location" value={formData.location} placeholder="Location" onChange={handleChange} />

                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Reserve">Reserve</option>
                        <option value="Out for Calibration">Out for Calibration</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Discontinued">Discontinued</option>
                    </select>

                    <label>Next Calibration Date:</label>
                    <input type="date" name="nextCalibrationDate" value={formData.nextCalibrationDate} onChange={handleChange} />

                    <label>Calibration Frequency (Months):</label>
                    <input type="number" name="calibrationFrequencyInMonths" value={formData.calibrationFrequencyInMonths} onChange={handleChange} />

                    {formData.status === 'Out for Calibration' && (
                        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--warning)', borderRadius: '0.5rem' }}>
                            <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>Calibration Logistics</h4>
                            <label>Sent Date:</label>
                            <input type="date" name="calibrationSentDate" value={formData.calibrationSentDate || ''} onChange={handleChange} />

                            <label>Lab Name:</label>
                            <input name="calibrationLab" value={formData.calibrationLab || ''} placeholder="Calibration Lab Name" onChange={handleChange} />

                            <label>Expected Return Date:</label>
                            <input type="date" name="calibrationReturnDate" value={formData.calibrationReturnDate || ''} onChange={handleChange} />
                        </div>
                    )}

                    <button type="submit">Update Equipment</button>
                </form>

                <div className="documents-section" style={{ marginTop: '2rem' }}>
                    <h3>Documents</h3>
                    {formData.documents && formData.documents.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {formData.documents.map((doc, index) => (
                                <li key={index} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{doc.name}</span>
                                    <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>View</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">No documents uploaded.</p>
                    )}
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                </div>

                <CalibrationHistory equipmentId={id} />
            </div>
        </Layout>
    );
};

export default EditEquipment;
