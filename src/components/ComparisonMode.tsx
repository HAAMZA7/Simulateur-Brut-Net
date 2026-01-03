import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ComparisonModeProps {
    currentBrut: number;
    isCadre: boolean;
    isMarried: boolean;
    enfants: number;
    calculerResultat: (brut: number) => {
        netApresImpots: number;
        cotisations: number;
        impotMensuel: number;
    };
}

export function ComparisonMode({ currentBrut, isCadre, isMarried, enfants, calculerResultat }: ComparisonModeProps) {
    const augmentations = [5, 10, 15, 20];

    const comparisons = useMemo(() => {
        const current = calculerResultat(currentBrut);
        return augmentations.map(pct => {
            const newBrut = currentBrut * (1 + pct / 100);
            const result = calculerResultat(newBrut);
            return {
                pct,
                newBrut,
                newNet: result.netApresImpots,
                delta: result.netApresImpots - current.netApresImpots,
                deltaPct: ((result.netApresImpots - current.netApresImpots) / current.netApresImpots) * 100
            };
        });
    }, [currentBrut, calculerResultat]);

    const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    return (
        <motion.div
            className="apple-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <h3 className="apple-card__title">🚀 Simuler une augmentation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {comparisons.map((c, i) => (
                    <motion.div
                        key={c.pct}
                        style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-status-success)', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', alignSelf: 'flex-start' }}>+{c.pct}%</span>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{fmt(c.newBrut)} € brut</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{fmt(c.newNet)} € net</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-status-success)', fontWeight: 600 }}>+{fmt(c.delta)} €/mois</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
