import { useState } from 'react';
import axios from '../api/axios';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth-token': token
                }
            });
            setFile(null);
            if (onUploadSuccess) {
                onUploadSuccess(res.data);
            }
        } catch (err) {
            setError('Upload failed. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-upload-container" style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '0.5rem' }}>
            <h4>Upload Document</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input type="file" onChange={handleFileChange} />
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
            {error && <p className="error" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>
    );
};

export default FileUpload;
