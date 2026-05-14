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
    const profileLabel = `${isCadre ? 'Cadre' : 'Non-cadre'} • ${isMarried ? 'Couple' : 'Seul'} • ${enfants} enfant${enfants > 1 ? 's' : ''}`;

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
                deltaPct: current.netApresImpots > 0
                    ? ((result.netApresImpots - current.netApresImpots) / current.netApresImpots) * 100
                    : 0
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
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div>
                    <h3 className="apple-card__title" style={{ marginBottom: '8px' }}>🚀 Simuler une augmentation</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        Impact réel sur le net après impôts pour votre profil actuel.
                    </p>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: '999px' }}>
                    {profileLabel}
                </span>
            </div>
            <div className="simulation-grid">
                {comparisons.map((c) => (
                    <motion.div
                        key={c.pct}
                        className="simulation-card"
                        whileHover={{ scale: 1.02 }}
                    >
                        <span className="simulation-badge">+{c.pct}%</span>
                        <div className="simulation-details">
                            <div className="simulation-brut">{fmt(c.newBrut)} € brut</div>
                            <div className="simulation-net">{fmt(c.newNet)} € net</div>
                            <div className="simulation-delta">+{fmt(c.delta)} €/mois • {c.deltaPct.toFixed(1)}%</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
