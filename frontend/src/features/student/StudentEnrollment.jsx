const StudentEnrollment = () => {
    return (
        <div style={{ color: '#2d3436' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Zapisy na projekty</h2>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#636e72', marginBottom: '20px' }}>
                    Poniżej znajdziesz listę dostępnych sekcji projektowych. Wybierz jedną z nich, aby dołączyć do grupy.
                </p>

                {/* Zastępcza tabela (Mockup) */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                        <th style={{ padding: '12px 8px' }}>Temat Projektu</th>
                        <th style={{ padding: '12px 8px' }}>Prowadzący</th>
                        <th style={{ padding: '12px 8px' }}>Zajęte miejsca</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcja</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr style={{ borderBottom: '1px solid #dfe6e9' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '500' }}>Ładowanie tematów...</td>
                        <td style={{ padding: '12px 8px', color: '#636e72' }}>---</td>
                        <td style={{ padding: '12px 8px' }}>---</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button disabled style={{ padding: '6px 12px', backgroundColor: '#b2bec3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed' }}>
                                Zapisz się
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentEnrollment;