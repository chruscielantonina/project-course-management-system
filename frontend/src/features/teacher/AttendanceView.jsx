import { useState } from 'react';

const studentsData = [];
const AttendanceView = () => {
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const [attendance, setAttendance] = useState({});

    const sections = [
        { id: 'SEC_A', name: 'Sekcja A (Poniedziałek 10:00)', studentIds: ['S001', 'S002', 'S003', 'S004', 'S005', 'S006'] },
        { id: 'SEC_B', name: 'Sekcja B (Wtorek 12:00)', studentIds: ['S007', 'S008', 'S009', 'S010', 'S011', 'S012'] }
    ];

    const currentSection = sections.find(sec => sec.id === selectedSection);
    const sectionStudents = currentSection
        ? studentsData.filter(student => currentSection.studentIds.includes(student.id))
        : [];

    const handleAttendanceChange = (studentId, isPresent) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: isPresent
        }));
    };

    const handleSave = () => {
        console.log("Zapisuję obecność dla daty:", selectedDate);
        console.log("Stan obecności:", attendance);
        alert('Obecność została pomyślnie zapisana!');
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Lista Obecności</h2>

            <div style={{ display: 'flex', gap: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Wybierz sekcję:</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9', minWidth: '250px' }}
                    >
                        <option value="">-- Wybierz z listy --</option>
                        {sections.map(sec => (
                            <option key={sec.id} value={sec.id}>{sec.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2d3436' }}>Wybierz datę zajęć:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                    />
                </div>
            </div>

            {selectedSection && selectedDate ? (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                            <th style={{ padding: '12px 8px' }}>ID</th>
                            <th style={{ padding: '12px 8px' }}>Imię i Nazwisko</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Obecny</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Nieobecny</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sectionStudents.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid #dfe6e9' }}>
                                <td style={{ padding: '12px 8px', color: '#636e72' }}>{student.id}</td>
                                <td style={{ padding: '12px 8px', fontWeight: '500' }}>{student.imie} {student.nazwisko}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                    <input
                                        type="radio"
                                        name={`attendance-${student.id}`}
                                        checked={attendance[student.id] === true}
                                        onChange={() => handleAttendanceChange(student.id, true)}
                                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                    />
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                    <input
                                        type="radio"
                                        name={`attendance-${student.id}`}
                                        checked={attendance[student.id] === false}
                                        onChange={() => handleAttendanceChange(student.id, false)}
                                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button
                            onClick={handleSave}
                            style={{ padding: '10px 30px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                        >
                            Zapisz obecność
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#b2bec3', backgroundColor: '#f5f6fa', borderRadius: '8px' }}>
                    Wybierz sekcję oraz datę zajęć z panelu powyżej, aby wyświetlić listę studentów.
                </div>
            )}
        </div>
    );
};

export default AttendanceView;