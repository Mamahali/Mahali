import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './login'; 
import ProductManagement from './ProductManagement';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';

function App() {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const navigate = useNavigate();

    const fetchData = async (endpoint, setState) => {
        try {
            setLoading(true);
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${endpoint}. Status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                setState(data);
            } else {
                const text = await response.text();
                setErrorMessage(`Expected JSON but got HTML content: ${text.substring(0, 200)}`);
                console.error('Received HTML content:', text);
            }
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            setErrorMessage(`Error fetching data from ${endpoint}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData('/api/users', setUsers);
        fetchData('/api/product', setProducts);
    }, []);

    useEffect(() => {
        if (activeUser) {
            localStorage.setItem('activeUser', JSON.stringify(activeUser));
        } else {
            localStorage.removeItem('activeUser');
        }
    }, [activeUser]);

    async function logoutUser() {
        const sessionToken = localStorage.getItem('sessionToken'); // Assuming session token is stored in localStorage
      
        try {
          const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionToken }),
          });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log('Logout successful:', data.message);
            localStorage.removeItem('sessionToken'); // Clear session token
          } else {
            console.log('Logout failed:', data.message);
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }
      
    return (
        <div className="App">
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {activeUser && (
                <nav style={navStyle}>
                    <button onClick={() => navigate('/dashboard')} style={buttonStyle}>Dashboard</button>
                    <button onClick={() => navigate('/productManagement')} style={buttonStyle}>Product Management</button>
                    <button onClick={() => navigate('/userManagement')} style={buttonStyle}>User Management</button>
                    <button id="logoutButton" onClick={logoutUser}>Logout</button>                </nav>
            )}

            {loading && <p>Loading...</p>}

            <Routes>
                <Route
                    path="/"
                    element={
                        activeUser ? (
                            <Navigate to="/dashboard" />
                        ) : (
                            <Login onLogin={setActiveUser} />
                        )
                    }
                />
                <Route
                    path="/dashboard"
                    element={activeUser ? <Dashboard products={products} /> : <Navigate to="/" />}
                />
                <Route
                    path="/productManagement"
                    element={
                        activeUser ? (
                            <ProductManagement setProducts={setProducts} products={products} />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
                <Route
                    path="/userManagement"
                    element={
                        activeUser ? (
                            <UserManagement users={users} setUsers={setUsers} />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>
        </div>
    );
}

const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '20px',
    backgroundColor: '#f4f4f4',
    padding: '10px 0',
};

const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
};

const logoutButtonStyle = {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
};

export default App;
