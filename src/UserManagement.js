import React, { useState, useEffect } from 'react';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); // State for error messages

    // Fetch users from the server
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('http://localhost:5000/api/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching users. Status: ${response.status}`);
                }
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    throw new Error('Expected JSON, but received a non-JSON response');
                }
            })
            .then(data => setUsers(data))
            .catch(error => {
                console.error('Error fetching users:', error);
                setErrorMessage(error.message.includes('404') ? 'User API endpoint not found.' : `Error fetching users: ${error.message}`);
                setUsers([]);
            });
    };

    const handleAddOrUpdateUser = () => {
        const newUser = { username, password };
    
        if (editingIndex !== null) {
            const userId = users[editingIndex].id;
            fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            setErrorMessage(err.message || 'Error updating user');
                        });
                    }
                    fetchUsers();
                })
                .catch(error => console.error('Error updating user:', error));
        } else {
            fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            setErrorMessage(err.message || 'Error adding user');
                        });
                    }
                    fetchUsers();
                })
                .catch(error => console.error('Error adding user:', error));
        }
    
        resetForm();
    };
    
    const resetForm = () => {
        setUsername('');
        setPassword('');
        setEditingIndex(null);
    };

    const editUser = index => {
        const user = users[index];
        setUsername(user.username);
        setPassword(user.password);
        setEditingIndex(index);
    };

    const deleteUser = index => {
        const userId = users[index].id;
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'DELETE',
        })
            .then(fetchUsers)
            .catch(error => console.error('Error deleting user:', error));
    };

    // Inline styles
    const containerStyle = {
        padding: '20px',
        backgroundColor: '#f4f4f4',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '800px',
        margin: 'auto',
    };

    const inputStyle = {
        marginBottom: '10px',
        padding: '8px',
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: '4px',
        border: '1px solid #ccc',
    };

    const buttonStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '10px',
    };

    const userCardStyle = {
        backgroundColor: '#ffffff',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '10px',
    };

    const headingStyle = {
        textAlign: 'center',
        color: '#333',
    };

    const listStyle = {
        listStyleType: 'none',
        paddingLeft: '0',
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '10px',
    };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>User Management</h2>

            {/* Render error message if it exists */}
            {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}

            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                style={inputStyle}
            />
            <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                style={inputStyle}
            />
            <button onClick={handleAddOrUpdateUser} style={buttonStyle}>
                {editingIndex !== null ? 'Update' : 'Add'} User
            </button>

            <h3 style={headingStyle}>User List</h3>
            {users.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No users available.</p>
            ) : (
                <ul style={listStyle}>
                    {users.map((user, index) => (
                        <li key={index} style={userCardStyle}>
                            <h4>{user.username}</h4>
                            <div style={buttonContainerStyle}>
                                <button
                                    onClick={() => editUser(index)}
                                    style={{ ...buttonStyle, backgroundColor: '#007bff', width: 'auto' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteUser(index)}
                                    style={{ ...buttonStyle, backgroundColor: '#e74c3c', width: 'auto' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UserManagement;
