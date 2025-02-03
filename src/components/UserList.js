import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [editUserId, setEditUserId] = useState(null);
    const [username, setUsername] = useState('');

    const fetchUsers = async () => {
        const response = await axios.get('http://185.3.172.83:5000/api/users');
        setUsers(response.data);
    };

    const handleEditUser = async (userId) => {
        await axios.put(`http://185.3.172.83:5000/api/users/${userId}`, { username });
        fetchUsers(); // Обновляем список пользователей
        setEditUserId(null); // Закрываем форму редактирования
    };

    const handleDeleteUser = async (userId) => {
        const confirmDelete = window.confirm('Вы уверены, что хотите удалить этого пользователя?');
        if (confirmDelete) {
            await axios.delete(`http://185.3.172.83:5000/api/users/${userId}`);
            fetchUsers(); // Обновляем список пользователей
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <h2>Все пользователи</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {editUserId === user.id ? (
                            <form onSubmit={() => handleEditUser(user.id)}>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <button type="submit">Сохранить</button>
                                <button onClick={() => setEditUserId(null)}>Отмена</button>
                            </form>
                        ) : (
                            <>
                                {user.username}
                                <button onClick={() => { setEditUserId(user.id); setUsername(user.username); }}>Редактировать</button>
                                <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
