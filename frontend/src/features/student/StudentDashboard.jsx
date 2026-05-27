import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMySection, getMyGrades, getMyAttendance, uploadProjectFile, downloadProjectFile, deleteProjectFile } from '../../api/studentApi';

const StudentDashboard = () => {
    const [mySection, setMySection] = useState(null);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const sectionRes = await getMySection();
            setMySection(sectionRes.data);

            if (sectionRes.data) {
                const gradesRes = await getMyGrades();
                setGrades(gradesRes.data || []);
                const attendanceRes = await getMyAttendance();
                setAttendance(attendanceRes.data || []);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setMySection(null);
            } else {
                setError('Nie udało się załadować danych o Twojej sekcji.');
                console.error(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const ProjectFileHandler = ({ section }) => {
        const [selectedFile, setSelectedFile] = useState(null);

        const handleFileChange = (event) => {
            setSelectedFile(event.target.files[0]);
        };

        const handleUpload = async () => {
            if (!selectedFile) {
                alert('Proszę wybrać plik.');
                return;
            }
            try {
                await uploadProjectFile(section.sectionId, selectedFile);
                alert('Plik został wysłany!');
                fetchData(); // Refresh data
            } catch (err) {
                alert('Błąd podczas wysyłania pliku.');
                console.error(err);
            }
        };

        const handleDownload = async () => {
            try {
                const response = await downloadProjectFile(section.sectionId);
                
                const contentDisposition = response.headers['content-disposition'];
                let filename = section.projectFileName; // fallback
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (err) {
                alert('Błąd podczas pobierania pliku.');
                console.error(err);
            }
        };

        const handleDelete = async () => {
            if (window.confirm('Czy na pewno chcesz usunąć plik projektu?')) {
                try {
                    await deleteProjectFile(section.sectionId);
                    alert('Plik został usunięty.');
                    fetchData(); // Refresh data
                } catch (err) {
                    alert('Błąd podczas usuwania pliku.');
                    console.error(err);
                }
            }
        };

        const getCleanFileName = (fullFileName) => {
            if (!fullFileName) return '';
            const parts = fullFileName.split('_');
            return parts.length > 2 ? parts.slice(2).join('_') : fullFileName;
        };

        return (
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3436', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                    Plik Projektu
                </h4>
                {section.projectFileName ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getCleanFileName(section.projectFileName)}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleDownload} style={{ padding: '8px 12px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pobierz</button>
                            <button onClick={handleDelete} style={{ padding: '8px 12px', backgroundColor: '#d63031', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Usuń</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <input type="file" onChange={handleFileChange} style={{ marginBottom: '10px', display: 'block' }} />
                        <button onClick={handleUpload} style={{ padding: '8px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Wyślij plik</button>
                    </div>
                )}
            </div>
        );
    };


    if (isLoading) {
        return (
            <div style={{ color: '#2d3436' }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Moja Sekcja Projektowa</h2>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <p>Ładowanie informacji o sekcji...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    const renderTable = (title, headers, data, renderRow) => (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3436', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                {title}
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #dfe6e9' }}>
                        {headers.map(header => <th key={header} style={{ padding: '12px 8px', fontSize: '14px' }}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? data.map(renderRow) : (
                        <tr><td colSpan={headers.length} style={{ padding: '12px 8px', color: '#636e72' }}>Brak danych.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            {mySection ? (
                <div>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '4px solid #0984e3', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0, color: '#0984e3', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                            {mySection.topic}
                        </h3>
                        <div style={{ marginTop: '15px', color: '#636e72' }}>
                            <p style={{ margin: '5px 0' }}><strong>Prowadzący:</strong> {mySection.teacherFullName}</p>
                            <p style={{ margin: '5px 0' }}><strong>Zapisani:</strong> {mySection.currentOccupancy} / {mySection.maxCapacity}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3436', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                                    Skład sekcji
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: 0 }}>
                                    {mySection.enrolledStudents.map(student => (
                                        <li key={student.studentId} style={{ padding: '10px 5px', borderBottom: '1px solid #f1f2f6', color: '#636e72' }}>
                                            {student.fullName}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <ProjectFileHandler section={mySection} />
                        </div>

                        {/* Right Column */}
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {renderTable("Moje Oceny", ["Ocena"], grades, (grade) => (
                                <tr key={grade.gradeId} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold', fontSize: '18px' }}>{grade.gradeValue}</td>
                                </tr>
                            ))}
                            {renderTable("Moja Frekwencja", ["Data", "Status"], attendance, (att) => (
                                 <tr key={att.attendanceId} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                    <td style={{ padding: '12px 8px' }}>{new Date(att.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: att.status === 'PRESENT' ? '#27ae60' : '#e74c3c' }}>
                                        {att.status}
                                    </td>
                                </tr>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0, color: '#2d3436' }}>Nie jesteś jeszcze zapisany/a do żadnej sekcji.</h3>
                    <p style={{ fontSize: '15px', marginTop: '10px', color: '#636e72' }}>
                        Aby dołączyć do projektu, przejdź do panelu zapisów.
                    </p>
                    <Link to="/student/enrollment" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 25px', backgroundColor: '#0984e3', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                        Przejdź do zapisów
                    </Link>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
