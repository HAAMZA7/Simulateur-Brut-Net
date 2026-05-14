import { motion } from 'framer-motion';

interface EmployerCostProps {
    brutMensuel: number;
    isCadre: boolean;
    annualFactor: number;
}

// Taux charges patronales moyennes France 2025
const TAUX_PATRONAL_NON_CADRE = 0.42;
const TAUX_PATRONAL_CADRE = 0.45;

export function EmployerCost({ brutMensuel, isCadre, annualFactor }: EmployerCostProps) {
    const taux = isCadre ? TAUX_PATRONAL_CADRE : TAUX_PATRONAL_NON_CADRE;
    const chargesPatronales = brutMensuel * taux;
    const coutTotal = brutMensuel + chargesPatronales;
    const coutParEuroBrut = brutMensuel > 0 ? coutTotal / brutMensuel : 0;
    const coutAnnuel = coutTotal * annualFactor;

    const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    return (
        <motion.div
            className="apple-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <h3 className="apple-card__title">🏢 Coût Employeur</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Ce que vous coûtez réellement à votre entreprise</p>

            <div style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '16px' }}>
                <div className="apple-list-row" style={{ border: 'none' }}>
                    <span className="apple-list-label">Salaire brut</span>
                    <span className="apple-list-value">{fmt(brutMensuel)} €</span>
                </div>
                <div className="apple-list-row" style={{ border: 'none' }}>
                    <span className="apple-list-label">Charges patronales (~{(taux * 100).toFixed(0)}%)</span>
                    <span className="apple-list-value">+{fmt(chargesPatronales)} €</span>
                </div>
                <div className="apple-list-row" style={{ border: 'none', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <span className="apple-list-label" style={{ fontWeight: 700 }}>Coût total employeur</span>
                    <span className="apple-list-value" style={{ fontSize: '20px', color: 'var(--color-brand)' }}>{fmt(coutTotal)} €</span>
                </div>
                <div className="apple-list-row" style={{ border: 'none', paddingBottom: 0 }}>
                    <span className="apple-list-label">Estimation annuelle</span>
                    <span className="apple-list-value">{fmt(coutAnnuel)} €</span>
                </div>
            </div>

            <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.5, background: 'rgba(0,113,227,0.05)', padding: '12px', borderRadius: '12px' }}>
                Pour 1 € de brut, votre employeur dépense environ {coutParEuroBrut > 0 ? `${coutParEuroBrut.toFixed(2)} €` : '—'}
            </p>
        </motion.div>
    );
}
