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
                            <div className="simulation-delta">+{fmt(c.delta)} €/mois</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
