import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const SubjectsView = () => {
    const [subjects, setSubjects] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newSubjectData, setNewSubjectData] = useState({ temat: '', status: 'aktywny' });

    const currentUser = "dr inż. Jan Kowalski";


    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axiosInstance.get('/api/topics');
                setSubjects(response.data);
            } catch (error) {
                console.error("Błąd podczas pobierania tematów:", error);
            }
        };

        fetchTopics();
    }, []);


    const handleDelete = async (idToRemove) => {
        if (window.confirm("Czy na pewno chcesz usunąć ten temat?")) {
            try {
                await axiosInstance.delete(`/api/topics/${idToRemove}`);
                setSubjects(subjects.filter(subject => subject.id !== idToRemove));
            } catch (error) {
                console.error("Błąd podczas usuwania:", error);
            }
        }
    };


    const handleCreateSubject = async (e) => {
        e.preventDefault();

        if (!newSubjectData.temat.trim()) {
            alert("Podaj nazwę tematu!");
            return;
        }

        try {

            const payload = {
                name: newSubjectData.temat,
                description: "Opis wygenerowany automatycznie z frontendu",
                active: newSubjectData.status === 'aktywny'
            };

            const response = await axiosInstance.post('/api/topics', payload);

            setSubjects([...subjects, response.data]);
            setShowCreateModal(false);
            setNewSubjectData({ temat: '', status: 'aktywny' });
        } catch (error) {
            console.error("Błąd podczas dodawania:", error);
            alert("Błąd. Sprawdź konsolę przeglądarki (Network) i IntelliJ.");
        }
    };

    return (

        <div style={{ position: 'relative' }}>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Zarządzanie Tematami</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        padding: '10px 20px', backgroundColor: '#0984e3', color: 'white',
                        border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    + Dodaj nowy temat
                </button>
            </div>


            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#636e72', marginBottom: '20px' }}>
                    Zalogowany jako: <strong>{currentUser}</strong>
                </p>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                        <th style={{ padding: '12px 8px' }}>ID</th>
                        <th style={{ padding: '12px 8px' }}>Temat Projektu</th>
                        <th style={{ padding: '12px 8px' }}>Prowadzący</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcje</th>
                    </tr>
                    </thead>
                    <tbody>
                    {subjects.map((subject) => (
                        <tr key={subject.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                            <td style={{ padding: '12px 8px', color: '#636e72' }}>{subject.id}</td>
                            <td style={{ padding: '12px 8px', fontWeight: '500' }}>{subject.name}</td>
                            <td style={{ padding: '12px 8px' }}>{subject.teacherName}</td>
                            <td style={{ padding: '12px 8px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    backgroundColor: subject.active ? '#e3fce0' : '#f1f2f6',
                                    color: subject.active ? '#27ae60' : '#7f8fa6'
                                }}>
                                {subject.active ? 'AKTYWNY' : 'NIEAKTYWNY'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                {subject.teacherName === currentUser ? (
                                    <>
                                        <button style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#fdcb6e', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edytuj</button>
                                        <button onClick={() => handleDelete(subject.id)} style={{ padding: '6px 12px', backgroundColor: '#ff7675', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Usuń</button>
                                    </>
                                ) : (
                                    <span style={{ color: '#b2bec3', fontSize: '13px' }}>Brak uprawnień</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>


            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '8px',
                        width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#2d3436' }}>Kreator nowego tematu</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#b2bec3' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#636e72' }}>Nazwa tematu:</label>
                                <input
                                    type="text"
                                    value={newSubjectData.temat}
                                    onChange={(e) => setNewSubjectData({...newSubjectData, temat: e.target.value})}
                                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                                    placeholder="np. Aplikacja e-commerce..."
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#636e72' }}>Status:</label>
                                <select
                                    value={newSubjectData.status}
                                    onChange={(e) => setNewSubjectData({...newSubjectData, status: e.target.value})}
                                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                                >
                                    <option value="aktywny">Aktywny</option>
                                    <option value="nieaktywny">Nieaktywny</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '10px', padding: '12px', backgroundColor: '#00b894',
                                    color: 'white', border: 'none', borderRadius: '4px',
                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                                }}
                            >
                                Zapisz temat
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsView;