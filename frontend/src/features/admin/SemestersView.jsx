import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', fontSize: '14px' };

const Modal = ({ title, onClose, children }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '440px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#2d3436' }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#b2bec3' }}>✕</button>
            </div>
            {children}
        </div>
    </div>
);

const FormField = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#636e72' }}>{label}</label>
        {children}
    </div>
);

const SemestersView = () => {
    const [semesters, setSemesters] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [newSemester, setNewSemester] = useState({ semYear: '', semField: '', isCurrent: false });
    const [editData, setEditData] = useState({ semYear: '', semField: '', isCurrent: false });

    useEffect(() => { fetchSemesters(); }, []);

    const fetchSemesters = async () => {
        try {
            const res = await axiosInstance.get('/api/admin/semesters');
            setSemesters(res.data);
        } catch (err) {
            console.error('Błąd pobierania semestrów:', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/admin/semesters', {
                semYear: parseInt(newSemester.semYear),
                semField: newSemester.semField,
                isCurrent: newSemester.isCurrent,
            });
            await fetchSemesters();
            setShowCreateModal(false);
            setNewSemester({ semYear: '', semField: '', isCurrent: false });
        } catch (err) {
            console.error('Błąd tworzenia semestru:', err);
            alert('Błąd podczas tworzenia semestru.');
        }
    };

    const handleEditOpen = (semester) => {
        setSelectedSemester(semester);
        setEditData({ semYear: semester.semYear, semField: semester.semField, isCurrent: semester.current });
        setShowEditModal(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/api/admin/semesters/${selectedSemester.semID}`, {
                semYear: parseInt(editData.semYear),
                semField: editData.semField,
                isCurrent: editData.isCurrent,
            });
            await fetchSemesters();
            setShowEditModal(false);
        } catch (err) {
            console.error('Błąd edycji semestru:', err);
            alert('Błąd podczas zapisywania zmian.');
        }
    };

    const handleDelete = async (semester) => {
        if (!window.confirm(`Usunąć semestr ${semester.semField} (${semester.semYear})?`)) return;
        try {
            await axiosInstance.delete(`/api/admin/semesters/${semester.semID}`);
            await fetchSemesters();
        } catch (err) {
            console.error('Błąd usuwania semestru:', err);
        }
    };

    return (
        <div style={{ position: 'relative' }}>

            {/* Nagłówek */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2d3436' }}>Zarządzanie Semestrami</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Nowy semestr
                </button>
            </div>

            {/* Tabela */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                            <th style={{ padding: '12px 8px' }}>Rok</th>
                            <th style={{ padding: '12px 8px' }}>Kierunek</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {semesters.map(semester => (
                            <tr key={semester.semID} style={{ borderBottom: '1px solid #dfe6e9' }}>
                                <td style={{ padding: '12px 8px', fontWeight: '500' }}>{semester.semYear}</td>
                                <td style={{ padding: '12px 8px' }}>{semester.semField}</td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                        backgroundColor: semester.current ? '#e3fce0' : '#f1f2f6',
                                        color: semester.current ? '#27ae60' : '#7f8fa6',
                                    }}>
                                        {semester.current ? 'AKTYWNY' : 'NIEAKTYWNY'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleEditOpen(semester)}
                                        style={{ marginRight: '6px', padding: '6px 12px', backgroundColor: '#fdcb6e', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Edytuj
                                    </button>
                                    <button
                                        onClick={() => handleDelete(semester)}
                                        style={{ padding: '6px 12px', backgroundColor: '#ff7675', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Usuń
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {semesters.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#b2bec3', padding: '20px' }}>Brak semestrów. Dodaj pierwszy.</p>
                )}
            </div>

            {/* Modal: Nowy semestr */}
            {showCreateModal && (
                <Modal title="Nowy semestr" onClose={() => setShowCreateModal(false)}>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Rok:">
                            <input
                                type="number"
                                value={newSemester.semYear}
                                onChange={e => setNewSemester({ ...newSemester, semYear: e.target.value })}
                                style={inputStyle}
                                placeholder="np. 2026"
                                required
                            />
                        </FormField>
                        <FormField label="Kierunek:">
                            <input
                                type="text"
                                value={newSemester.semField}
                                onChange={e => setNewSemester({ ...newSemester, semField: e.target.value })}
                                style={inputStyle}
                                placeholder="np. Informatyka"
                                required
                            />
                        </FormField>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="createIsCurrent"
                                checked={newSemester.isCurrent}
                                onChange={e => setNewSemester({ ...newSemester, isCurrent: e.target.checked })}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="createIsCurrent" style={{ fontSize: '14px', fontWeight: 'bold', color: '#636e72', cursor: 'pointer' }}>
                                Aktywny semestr
                            </label>
                        </div>
                        <button type="submit" style={{ marginTop: '5px', padding: '12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                            Utwórz semestr
                        </button>
                    </form>
                </Modal>
            )}

            {/* Modal: Edycja */}
            {showEditModal && selectedSemester && (
                <Modal title={`Edytuj: ${selectedSemester.semField} (${selectedSemester.semYear})`} onClose={() => setShowEditModal(false)}>
                    <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Rok:">
                            <input
                                type="number"
                                value={editData.semYear}
                                onChange={e => setEditData({ ...editData, semYear: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </FormField>
                        <FormField label="Kierunek:">
                            <input
                                type="text"
                                value={editData.semField}
                                onChange={e => setEditData({ ...editData, semField: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </FormField>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="editIsCurrent"
                                checked={editData.isCurrent}
                                onChange={e => setEditData({ ...editData, isCurrent: e.target.checked })}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="editIsCurrent" style={{ fontSize: '14px', fontWeight: 'bold', color: '#636e72', cursor: 'pointer' }}>
                                Aktywny semestr
                            </label>
                        </div>
                        <button type="submit" style={{ marginTop: '5px', padding: '12px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                            Zapisz zmiany
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SemestersView;
