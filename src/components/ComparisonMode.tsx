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
            className="comparison-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h3 className="comparison-title">🚀 Simuler une augmentation</h3>
            <div className="comparison-grid">
                {comparisons.map((c, i) => (
                    <motion.div
                        key={c.pct}
                        className="comparison-item"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <span className="comparison-badge">+{c.pct}%</span>
                        <div className="comparison-details">
                            <span className="comparison-brut">{fmt(c.newBrut)} € brut</span>
                            <span className="comparison-net">{fmt(c.newNet)} € net</span>
                            <span className="comparison-delta">+{fmt(c.delta)} €/mois</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
