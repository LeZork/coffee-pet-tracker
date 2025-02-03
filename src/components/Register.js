// src/components/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ErrorNotification from './ErrorNotification';

const Register = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        try {
            await axios.post('http://185.3.172.83:5000/api/register', { username, password });
            toast.success('Регистрация прошла успешно!');
            onLogin(username, password);
        } catch (error) {
            console.error('Ошибка регистрации:', error.response ? error.response.data : error.message);
            setError(error.response?.data?.message || 'Ошибка регистрации. Пожалуйста, попробуйте еще раз.');
            toast.error(error.response?.data?.message || 'Ошибка регистрации. Пожалуйста, попробуйте еще раз.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Регистрация</h2>
            <div className="card">
                <div className="card-body">
                    {error && <ErrorNotification message={error} onClose={() => setError('')} />}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Имя пользователя</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Введите имя пользователя"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Пароль</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Зарегистрироваться</button>
                    </form>
                    <div className="mt-3 text-center">
                        <p>Уже зарегистрированы? <Link to="/login">Войти</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;