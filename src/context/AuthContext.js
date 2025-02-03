import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(() => {
        return localStorage.getItem('userId') ? JSON.parse(localStorage.getItem('userId')) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    const handleLogin = async (username, password) => {
        try {
            // Сначала выполняем запрос на аутентификацию
            const loginResponse = await axios.post('http://185.3.172.83:5000/api/login', {
                username,
                password
            });

            if (loginResponse.data.success) {
                const { token, user } = loginResponse.data;
                
                // Сохраняем токен и ID пользователя
                setToken(token);
                setUserId(user.id);
                localStorage.setItem('token', token);
                localStorage.setItem('userId', JSON.stringify(user.id));
                
                return token;
            } else {
                throw new Error(loginResponse.data.message || 'Ошибка входа');
            }
        } catch (error) {
            console.error('Ошибка входа:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const handleLogout = () => {
        setUserId(null);
        setToken('');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    };

    return (
        <AuthContext.Provider value={{ userId, token, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);