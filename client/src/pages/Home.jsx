import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div>
            <h1>Welcome to EDITH</h1>
            {user ? (
                <div>
                    <p>Hello, {user.username}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <p>Please login</p>
            )}
        </div>
    );
};

export default Home;
