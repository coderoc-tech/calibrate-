import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    FaBars, FaHome, FaTools, FaFileAlt, FaCog, FaSignOutAlt,
    FaChevronLeft, FaChevronRight, FaClipboardCheck, FaBell,
    FaChartPie, FaList, FaUser
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <h2>EDITH</h2>}
                <button onClick={toggleSidebar} className="toggle-btn">
                    {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>
            <nav className="sidebar-nav">
                <Link to="/" className={`nav-item ${isActive('/')}`} title="Home">
                    <FaHome className="nav-icon" />
                    {!collapsed && <span>Home</span>}
                </Link>

                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                    <Link to="/add-equipment" className={`nav-item ${isActive('/add-equipment')}`} title="Equipment Management">
                        <FaTools className="nav-icon" />
                        {!collapsed && <span>Equipment Management</span>}
                    </Link>
                )}

                <Link to="/calibration-status" className={`nav-item ${isActive('/calibration-status')}`} title="Calibration Status">
                    <FaClipboardCheck className="nav-icon" />
                    {!collapsed && <span>Calibration Status</span>}
                </Link>

                <Link to="/reports" className={`nav-item ${isActive('/reports')}`} title="Reports">
                    <FaFileAlt className="nav-icon" />
                    {!collapsed && <span>Reports</span>}
                </Link>

                <Link to="/notifications" className={`nav-item ${isActive('/notifications')}`} title="Notification">
                    <FaBell className="nav-icon" />
                    {!collapsed && <span>Notification</span>}
                </Link>

                <Link to="/visualizer" className={`nav-item ${isActive('/visualizer')}`} title="Visualizer">
                    <FaChartPie className="nav-icon" />
                    {!collapsed && <span>Visualizer</span>}
                </Link>

                <Link to="/users" className={`nav-item ${isActive('/users')}`} title="User">
                    <FaUser className="nav-icon" />
                    {!collapsed && <span>User</span>}
                </Link>
            </nav>
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">{user?.username?.charAt(0).toUpperCase()}</div>
                    {!collapsed && (
                        <div className="user-details">
                            <span className="username">{user?.username}</span>
                            <span className="role">{user?.role}</span>
                        </div>
                    )}
                </div>
                <button onClick={handleLogout} className="logout-btn-sidebar" title="Logout">
                    <FaSignOutAlt />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
