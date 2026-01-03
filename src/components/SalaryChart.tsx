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
            className="apple-card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
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
                        formatter={(value: any) => [`${fmt(Number(value))} €`]}
                        contentStyle={{
                            backgroundColor: 'var(--color-surface-card)',
                            borderColor: 'var(--color-border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-primary)',
                            boxShadow: 'var(--effect-shadow-card)'
                        }}
                        itemStyle={{ color: 'var(--color-text-primary)' }}
                        labelStyle={{ color: 'var(--color-text-secondary)' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -150%)', textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{fmt(total)} €</span>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Brut</span>
            </div>

            <div style={{ width: '100%', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.map((item, i) => (
                    <motion.div
                        key={item.name}
                        className="apple-list-row"
                        style={{ padding: '8px 0', borderBottom: '1px solid var(--color-bg-secondary)' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                            <span className="apple-list-label">{item.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="apple-list-value">{fmt(item.value)} €</span>
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>({((item.value / total) * 100).toFixed(0)}%)</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
