import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const Loading = () => {
    return (
        <Container className="text-center mt-5">
            <Spinner animation="border" />
            <p>Загрузка...</p>
        </Container>
    );
};

export default Loading; 