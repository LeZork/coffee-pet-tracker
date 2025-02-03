import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import io from 'socket.io-client';

const socket = io('http://185.3.172.83:5000'); // Убедитесь, что адрес сервера правильный

const Notification = () => {
    useEffect(() => {
        socket.on('feedingReminder', (message) => {
            if (message) {
                toast.info(message);
            } else {
                console.error('Получено пустое сообщение от сокета');
            }
        });

        return () => {
            socket.off('feedingReminder');
        };
    }, []);

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        </div>
    );
};

export default Notification;
