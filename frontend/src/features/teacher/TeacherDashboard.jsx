import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios'; // Importujemy naszego skonfigurowanego klienta

const TeacherDashboard = () => {
    const [topics, setTopics] = useState([]);
    const [error, setError] = useState(null);

    // useEffect wywoła się automatycznie po załadowaniu komponentu
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                // Zapytanie trafia pod http://localhost:8080/api/topics
                const response = await axiosInstance.get('/api/topics');
                setTopics(response.data);
            } catch (err) {
                console.error("Błąd pobierania:", err);
                setError("Nie udało się pobrać tematów. Upewnij się, że jesteś zalogowany i backend działa.");
            }
        };

        fetchTopics();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Panel Prowadzącego</h1>
            <h2>Lista Tematów Projektów</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
                {topics.map(topic => (
                    // Dopasuj topic.id i topic.temat do struktury zwracanej przez Spring Boot (np. topic.title)
                    <li key={topic.id}>{topic.title} - {topic.status}</li>
                ))}
            </ul>
        </div>
    );
};

export default TeacherDashboard;