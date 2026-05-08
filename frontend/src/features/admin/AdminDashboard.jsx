import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const roleBadge = (role) => {
    const map = {
        ADMIN:   { bg: '#fce4ec', color: '#c62828', label: 'ADM' },
        TEACHER: { bg: '#e8f5e9', color: '#2e7d32', label: 'PROW' },
        STUDENT: { bg: '#e3f2fd', color: '#1565c0', label: 'STUDENT' },
    };
    const s = map[role] || map.STUDENT;
    return (
        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
};


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

const FormField = ({ label, hint, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#636e72' }}>{label}</label>
        {children}
        {hint && <span style={{ fontSize: '12px', color: '#b2bec3' }}>{hint}</span>}
    </div>
);

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', accountType: 'STUDENT' });
    const [editData, setEditData] = useState({ firstName: '', lastName: '', email: '' });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const [sRes, tRes] = await Promise.all([
                axiosInstance.get('/api/admin/students'),
                axiosInstance.get('/api/admin/teachers'),
            ]);
            setStudents(sRes.data);
            setTeachers(tRes.data);
        } catch (err) {
            console.error('Błąd pobierania użytkowników:', err);
        }
    };

    const adminEmail = localStorage.getItem('email') || 'admin@polsl.pl';
    const allUsers = [
        { id: 'admin', firstName: 'Administrator', lastName: '', email: adminEmail, role: 'ADMIN' },
        ...teachers.map(t => ({ id: t.tID, firstName: t.tFirstName, lastName: t.tLastName, email: t.email, role: 'TEACHER' })),
        ...students.map(s => ({ id: s.sID, firstName: s.sFirstName, lastName: s.sLastName, email: s.email, role: 'STUDENT' })),
    ];

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/admin/accounts', newUser);
            await fetchUsers();
            setShowCreateModal(false);
            setNewUser({ firstName: '', lastName: '', email: '', password: '', accountType: 'STUDENT' });
        } catch (err) {
            console.error('Błąd tworzenia konta:', err);
            alert('Błąd podczas tworzenia konta. Sprawdź dane i spróbuj ponownie.');
        }
    };

    const handleEditOpen = (user) => {
        setSelectedUser(user);
        setEditData({ firstName: user.firstName, lastName: user.lastName, email: user.email });
        setShowEditModal(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = selectedUser.role === 'STUDENT'
                ? `/api/admin/students/${selectedUser.id}`
                : `/api/admin/teachers/${selectedUser.id}`;
            await axiosInstance.put(endpoint, editData);
            await fetchUsers();
            setShowEditModal(false);
        } catch (err) {
            console.error('Błąd edycji:', err);
            alert('Błąd podczas zapisywania zmian.');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Usunąć konto ${user.firstName} ${user.lastName} (${user.email})?`)) return;
        try {
            const endpoint = user.role === 'STUDENT'
                ? `/api/admin/students/${user.id}`
                : `/api/admin/teachers/${user.id}`;
            await axiosInstance.delete(endpoint);
            await fetchUsers();
        } catch (err) {
            console.error('Błąd usuwania:', err);
        }
    };

    return (
        <div style={{ position: 'relative' }}>

            {/* Karty statystyk */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'Administratorzy', count: 1, color: '#e74c3c' },
                    { label: 'Prowadzący',       count: teachers.length, color: '#0984e3' },
                    { label: 'Studenci',          count: students.length, color: '#00b894' },
                ].map(card => (
                    <div key={card.label} style={{
                        flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: `4px solid ${card.color}`,
                    }}>
                        <p style={{ color: '#636e72', fontSize: '14px', marginBottom: '8px' }}>{card.label}</p>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: card.color, margin: 0 }}>{card.count}</p>
                    </div>
                ))}
            </div>

            {/* Nagłówek */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2d3436' }}>Zarządzanie Użytkownikami</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{ padding: '10px 20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Nowe konto
                </button>
            </div>

            {/* Tabela */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                            <th style={{ padding: '12px 8px' }}>Login</th>
                            <th style={{ padding: '12px 8px' }}>Imię i nazwisko</th>
                            <th style={{ padding: '12px 8px' }}>Rola</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map(user => {
                            const isAdmin = user.role === 'ADMIN';
                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                                    <td style={{ padding: '12px 8px', color: '#636e72' }}>{user.email}</td>
                                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{user.firstName} {user.lastName}</td>
                                    <td style={{ padding: '12px 8px' }}>{roleBadge(user.role)}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                        {isAdmin ? (
                                            <span style={{ color: '#b2bec3', fontSize: '13px' }}>Konto systemowe</span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditOpen(user)}
                                                    style={{ marginRight: '6px', padding: '6px 12px', backgroundColor: '#fdcb6e', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Edytuj
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    style={{ padding: '6px 12px', backgroundColor: '#ff7675', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Usuń
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {allUsers.length <= 1 && (
                    <p style={{ textAlign: 'center', color: '#b2bec3', padding: '20px' }}>Brak użytkowników do wyświetlenia</p>
                )}
            </div>

            {/* Modal: Nowe konto */}
            {showCreateModal && (
                <Modal title="Nowe konto użytkownika" onClose={() => setShowCreateModal(false)}>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Imię:">
                            <input type="text" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <FormField label="Nazwisko:">
                            <input type="text" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <FormField label="Login (email):">
                            <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <FormField label="Hasło:">
                            <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <FormField label="Rola:" hint="Użytkownik może wystąpić tylko w jednej roli">
                            <select value={newUser.accountType} onChange={e => setNewUser({ ...newUser, accountType: e.target.value })} style={inputStyle}>
                                <option value="STUDENT">STUDENT</option>
                                <option value="TEACHER">PROW – Prowadzący</option>
                                <option value="ADMIN">ADM – Administrator</option>
                            </select>
                        </FormField>
                        <button type="submit" style={{ marginTop: '5px', padding: '12px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                            Utwórz konto
                        </button>
                    </form>
                </Modal>
            )}

            {/* Modal: Edycja */}
            {showEditModal && selectedUser && (
                <Modal title={`Edytuj: ${selectedUser.firstName} ${selectedUser.lastName}`} onClose={() => setShowEditModal(false)}>
                    <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FormField label="Imię:">
                            <input type="text" value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <FormField label="Nazwisko:">
                            <input type="text" value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <FormField label="Email:">
                            <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={inputStyle} required />
                        </FormField>
                        <button type="submit" style={{ marginTop: '5px', padding: '12px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                            Zapisz zmiany
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
