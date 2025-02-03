import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Form, Button } from 'react-bootstrap';
import ErrorNotification from './ErrorNotification';

const Login = () => {
    const { handleLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            await handleLogin(username, password);
            // Используем уникальный ID для toast
            toast.success('Успешный вход!', {
                toastId: 'login-success',
                autoClose: 2000, // Закрываем через 2 секунды
                onClose: () => navigate('/pets') // Перенаправляем после закрытия toast
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ошибка входа. Проверьте свои учетные данные.';
            setError(errorMessage);
            toast.error(errorMessage, {
                toastId: 'login-error'
            });
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Вход в систему</h2>
            <div className="card">
                <div className="card-body">
                    {error && <ErrorNotification message={error} onClose={() => setError('')} />}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя пользователя</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите имя пользователя"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100">
                            Войти
                        </Button>
                    </Form>
                    <div className="mt-3 text-center">
                        <p>Нет учетной записи? <Link to="/register">Зарегистрироваться</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;