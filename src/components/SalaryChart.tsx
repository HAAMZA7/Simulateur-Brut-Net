import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface SalaryChartProps {
    netApresImpots: number;
    cotisations: number;
    impot: number;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export function SalaryChart({ netApresImpots, cotisations, impot }: SalaryChartProps) {
    const data = [
        { name: 'Net à payer', value: netApresImpots, color: '#22c55e' },
        { name: 'Cotisations', value: cotisations, color: '#ef4444' },
        { name: 'Impôts', value: impot, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const total = data.reduce((acc, d) => acc + d.value, 0);
    const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    return (
        <motion.div
            className="chart-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `${fmt(value)} €`}
                        contentStyle={{
                            background: 'rgba(24, 24, 27, 0.95)',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fafafa'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="chart-center">
                <span className="chart-total">{fmt(total)} €</span>
                <span className="chart-label">Brut</span>
            </div>

            <div className="chart-legend">
                {data.map((item, i) => (
                    <motion.div
                        key={item.name}
                        className="legend-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">{fmt(item.value)} €</span>
                        <span className="legend-percent">({((item.value / total) * 100).toFixed(0)}%)</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
