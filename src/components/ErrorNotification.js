import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ErrorNotification = ({ message, onClose }) => {
    return (
        <ToastContainer position="top-right">
            <Toast onClose={onClose} bg="danger" autohide>
                <Toast.Body>{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default ErrorNotification; 