// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import PetDetails from './components/PetDetails';
import AllPets from './components/AllPets';
import AddPet from './components/AddPet';
import EditPet from './components/EditPet';
import UserList from './components/UserList';
import PetStatistics from './components/PetStatistics';
import Login from './components/Login';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Notification from './components/Notification';
import Loading from './components/Loading';
import PetDiary from './components/PetDiary';
import { useCallback } from 'react';

const App = () => {
    const { userId } = useAuth();
    const [pets, setPets] = useState([]); // Добавляем состояние pets
    const [loading, setLoading] = useState(true);

    // Добавляем функцию handleLogout
    const handleLogout = () => {
        // Здесь должна быть ваша логика выхода
        // Например:
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const fetchPets = useCallback(async () => {
        if (userId) {
            try {
                const response = await axios.get(`http://185.3.172.83:5000/api/pets/${userId}`);
                setPets(response.data);
            } catch (error) {
                console.error('Ошибка получения питомцев:', error);
                toast.error('Ошибка получения питомцев.');
            }
        }
    }, [userId]);

    useEffect(() => {
        const initializeApp = async () => {
            if (userId) {
                await fetchPets();
            }
            setLoading(false); // Устанавливаем loading в false после загрузки данных
        };

        initializeApp();
    }, [userId, fetchPets]);

    if (loading) {
        return <Loading />;
    }

    return (
        <Router>
            <div className="container mt-4">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <Link className="navbar-brand" to="/">Coffee Pet Tracker ☕</Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav">
                                {userId ? (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/pets">Все питомцы</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/profile">Профиль пользователя</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/pets/add">Добавить питомца</Link>
                                        </li>
                                        <li className="nav-item">
                                            <button className="btn btn-link nav-link" onClick={handleLogout}>Выйти</button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/login">Войти</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/register">Регистрация</Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </nav>
                <Routes>
    <Route path="/" element={userId ? <Navigate to="/pets" /> : <Navigate to="/login" />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={userId ? <UserProfile userId={userId} /> : <Navigate to="/login" />} />
    {userId && (
        <>
            <Route path="/users" element={<UserList />} />
            <Route path="/pets/stats" element={<PetStatistics userId={userId} />} />
            <Route path="/pets" element={<AllPets userId={userId} />} />
            <Route path="/pets/add" element={<AddPet userId={userId} onAdd={fetchPets} />} />
            <Route path="/pets/edit/:id" element={<EditPet />} />
            {/* Используем параметр маршрута для petId */}
            <Route path="/pets/:id" element={<PetDetails />} />
            {/* Используем тот же формат для маршрута дневника */}
            <Route path="/pets/:id/diary" element={<PetDiary />} />
        </>
    )}
</Routes>
                <Notification />
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    limit={1}  // Ограничиваем количество одновременных уведомлений
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}  // Отключаем паузу при потере фокуса
                    draggable
                    pauseOnHover={false}  // Отключаем паузу при наведении
                    theme="light"
                />
            </div>
        </Router>
    );
};

const AppWrapper = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default AppWrapper;