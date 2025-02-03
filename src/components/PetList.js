import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ListGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PetList = ({ ownerId }) => {
    const [pets, setPets] = useState([]);

    const fetchPets = async () => {
        try {
            const response = await axios.get(`http://185.3.172.83:5000/api/pets/${ownerId}`);
            setPets(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке питомцев:', error);
        }
    };

    useEffect(() => {
        fetchPets();
    }, [ownerId]);

    const handleDeletePet = async (petId) => {
        try {
            await axios.delete(`http://185.3.172.83:5000/api/pets/${petId}`);
            setPets(pets.filter(pet => pet.id !== petId));
            toast.success('Питомец успешно удален!');
        } catch (error) {
            console.error('Ошибка при удалении питомца:', error);
            toast.error('Ошибка при удалении питомца.');
        }
    };

    return (
        <ListGroup>
            {pets.map(pet => (
                <ListGroup.Item key={pet.id} className="d-flex justify-content-between align-items-center">
                    {pet.name} - {pet.species}
                    <Button variant="danger" onClick={() => handleDeletePet(pet.id)}>Удалить</Button>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default PetList; 