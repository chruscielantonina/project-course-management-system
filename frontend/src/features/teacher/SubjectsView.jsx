import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const SubjectsView = () => {
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState(null);

    const [newSubjectData, setNewSubjectData] = useState({ name: '', description: '', active: true });
    const [editSubjectData, setEditSubjectData] = useState({ id: '', name: '', description: '', active: true });

    const currentUser = localStorage.getItem('userRole') || "Nauczyciel";

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const response = await axiosInstance.get('/api/topics');
            setSubjects(response.data);
        } catch (error) { console.error("Błąd pobierania tematów:", error); }
    };

    const handleDelete = async (idToRemove) => {
        if (window.confirm("Czy na pewno chcesz usunąć ten temat?")) {
            try {
                await axiosInstance.delete(`/api/topics/${idToRemove}`);
                setSubjects(subjects.filter(subject => subject.id !== idToRemove));
            } catch (error) { console.error("Błąd podczas usuwania:", error); }
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectData.name.trim()) return alert("Podaj nazwę tematu!");

        try {
            const response = await axiosInstance.post('/api/topics', newSubjectData);
            setSubjects([...subjects, response.data]);
            setShowCreateModal(false);
            setNewSubjectData({ name: '', description: '', active: true });
        } catch (error) { alert("Błąd podczas dodawania tematu."); }
    };

    const handleUpdateSubject = async (e) => {
        e.preventDefault();
        if (!editSubjectData.name.trim()) return alert("Podaj nazwę tematu!");

        try {
            const payload = {
                name: editSubjectData.name,
                description: editSubjectData.description,
                active: editSubjectData.active
            };
            const response = await axiosInstance.put(`/api/topics/${editSubjectData.id}`, payload);

            setSubjects(subjects.map(sub => sub.id === editSubjectData.id ? response.data : sub));
            setShowEditModal(false);
        } catch (error) {
            console.error(error);
            alert("Błąd podczas edycji tematu.");
        }
    };

    const openDetails = (subject) => {
        setSelectedSubject(subject);
        setShowDetailsModal(true);
    };

    const openEdit = (subject) => {
        setEditSubjectData({
            id: subject.id,
            name: subject.name,
            description: subject.description || '',
            active: subject.isActive
        });
        setShowEditModal(true);
    };

    const filteredSubjects = subjects.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: 'relative', color: '#2d3436' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Zarządzanie Tematami</h2>
                <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Dodaj nowy temat
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Szukaj tematu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px 15px', width: '100%', maxWidth: '400px', borderRadius: '5px', border: '1px solid #dfe6e9', fontSize: '15px' }}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                        <th style={{ padding: '12px 8px' }}>Temat Projektu</th>
                        <th style={{ padding: '12px 8px' }}>Prowadzący</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcje</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
                        <tr key={subject.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                            <td style={{ padding: '12px 8px', fontWeight: '500' }}>{subject.name}</td>
                            <td style={{ padding: '12px 8px' }}>{subject.teacherName || "Brak danych"}</td>
                            <td style={{ padding: '12px 8px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: subject.isActive ? '#e3fce0' : '#ffeaea', color: subject.isActive ? '#27ae60' : '#d63031' }}>
                                    {subject.isActive ? 'AKTYWNY' : 'NIEAKTYWNY'}
                                </span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                <button onClick={() => openDetails(subject)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Szczegóły</button>
                                <button onClick={() => openEdit(subject)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#fdcb6e', color: '#2d3436', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Edytuj</button>
                                <button onClick={() => handleDelete(subject.id)} style={{ padding: '6px 12px', backgroundColor: '#ff7675', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Usuń</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#b2bec3' }}>Brak tematów pasujących do wyszukiwania.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {showDetailsModal && selectedSubject && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dfe6e9', paddingBottom: '15px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#2d3436' }}>Szczegóły tematu</h3>
                            <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#2d3436', fontWeight: 'bold' }}>✕</button>
                        </div>
                        <h4 style={{ color: '#0984e3', fontSize: '18px', marginTop: 0 }}>{selectedSubject.name}</h4>
                        <p style={{ color: '#636e72', lineHeight: '1.6', backgroundColor: '#f5f6fa', padding: '15px', borderRadius: '5px' }}>
                            {selectedSubject.description || "Brak opisu dla tego tematu."}
                        </p>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Kreator nowego tematu</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#2d3436', fontWeight: 'bold' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Nazwa tematu:</label>
                                <input type="text" required value={newSubjectData.name} onChange={(e) => setNewSubjectData({...newSubjectData, name: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Opis (wymagania, cel projektu):</label>
                                <textarea rows="4" value={newSubjectData.description} onChange={(e) => setNewSubjectData({...newSubjectData, description: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Status:</label>
                                <select value={newSubjectData.active} onChange={(e) => setNewSubjectData({...newSubjectData, active: e.target.value === 'true'})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="true">Aktywny</option>
                                    <option value="false">Nieaktywny</option>
                                </select>
                            </div>
                            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Zapisz temat</button>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Edycja tematu</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#2d3436', fontWeight: 'bold' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Nazwa tematu:</label>
                                <input type="text" required value={editSubjectData.name} onChange={(e) => setEditSubjectData({...editSubjectData, name: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Opis (wymagania, cel projektu):</label>
                                <textarea rows="4" value={editSubjectData.description} onChange={(e) => setEditSubjectData({...editSubjectData, description: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Status:</label>
                                <select value={editSubjectData.active} onChange={(e) => setEditSubjectData({...editSubjectData, active: e.target.value === 'true'})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}>
                                    <option value="true">Aktywny</option>
                                    <option value="false">Nieaktywny</option>
                                </select>
                            </div>
                            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#fdcb6e', color: '#2d3436', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Zaktualizuj temat</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsView;