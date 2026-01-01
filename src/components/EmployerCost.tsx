import { motion } from 'framer-motion';

interface EmployerCostProps {
    brutMensuel: number;
    isCadre: boolean;
}

// Taux charges patronales moyennes France 2025
const TAUX_PATRONAL_NON_CADRE = 0.42;
const TAUX_PATRONAL_CADRE = 0.45;

export function EmployerCost({ brutMensuel, isCadre }: EmployerCostProps) {
    const taux = isCadre ? TAUX_PATRONAL_CADRE : TAUX_PATRONAL_NON_CADRE;
    const chargesPatronales = brutMensuel * taux;
    const coutTotal = brutMensuel + chargesPatronales;

    const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    return (
        <motion.div
            className="employer-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <h3 className="employer-title">🏢 Coût Employeur</h3>
            <p className="employer-subtitle">Ce que vous coûtez réellement à votre entreprise</p>

            <div className="employer-breakdown">
                <div className="employer-line">
                    <span>Salaire brut</span>
                    <span className="employer-value">{fmt(brutMensuel)} €</span>
                </div>
                <div className="employer-line charges">
                    <span>Charges patronales (~{(taux * 100).toFixed(0)}%)</span>
                    <span className="employer-value">+{fmt(chargesPatronales)} €</span>
                </div>
                <div className="employer-total">
                    <span>Coût total employeur</span>
                    <span className="employer-value-big">{fmt(coutTotal)} €</span>
                </div>
            </div>

            <p className="employer-note">
                Pour chaque {fmt(1)} € net que vous recevez, votre employeur dépense environ {((coutTotal / (brutMensuel * (1 - (isCadre ? 0.25 : 0.22)))).toFixed(2))} €
            </p>
        </motion.div>
    );
}
