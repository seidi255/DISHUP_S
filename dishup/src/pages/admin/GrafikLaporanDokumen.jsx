import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

export default function GrafikLaporanDokumen({ rows }) {

    // === Data Dokumen per Jenis ===
    const jenisMap = {};
    rows.forEach(r => {
        jenisMap[r.jenis_dokumen] = (jenisMap[r.jenis_dokumen] || 0) + 1;
    });

    const dataJenis = Object.keys(jenisMap).map(j => ({
        name: j,
        total: jenisMap[j]
    }));

    // === Data Status Akses ===
    const publik = rows.filter(r => !r.is_private).length;
    const privateDoc = rows.filter(r => r.is_private).length;

    const dataStatus = [
        { name: "Publik", value: publik },
        { name: "Private", value: privateDoc }
    ];

    const COLORS = ["#198754", "#dc3545"];

    return (
        <div className="row mt-4">
            {/* Bar Chart */}
            <div className="col-md-6">
                <h6 className="text-center">Jumlah Dokumen per Jenis</h6>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataJenis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#0d6efd" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="col-md-6">
                <h6 className="text-center">Status Akses Dokumen</h6>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={dataStatus}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {dataStatus.map((_, i) => (
                                <Cell key={i} fill={COLORS[i]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
