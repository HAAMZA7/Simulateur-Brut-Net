import React, { useState } from 'react';
import { calculateSalary } from './logic/calculateSalary';

function App() {
  const [grossSalary, setGrossSalary] = useState('');
  const [status, setStatus] = useState('non-cadre');
  const [period, setPeriod] = useState('monthly');
  const [results, setResults] = useState(null);

  const handleSalaryChange = (e) => {
    const newGrossSalary = parseFloat(e.target.value);
    setGrossSalary(e.target.value);
    const newResults = calculateSalary(newGrossSalary, status, period);
    setResults(newResults);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const newGrossSalary = parseFloat(grossSalary);
    const newResults = calculateSalary(newGrossSalary, newStatus, period);
    setResults(newResults);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const newGrossSalary = parseFloat(grossSalary);
    const newResults = calculateSalary(newGrossSalary, status, newPeriod);
    setResults(newResults);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  return (
    <div className="App">
      <h1>Simulateur de Salaire Brut en Net</h1>
      <div className="card">
        <div className="input-group">
          <input
            type="number"
            value={grossSalary}
            onChange={handleSalaryChange}
            placeholder="Entrez le salaire brut"
          />
          <div className="period-toggle">
            <button onClick={() => handlePeriodChange('monthly')} className={period === 'monthly' ? 'active' : ''}>Mensuel</button>
            <button onClick={() => handlePeriodChange('annual')} className={period === 'annual' ? 'active' : ''}>Annuel</button>
          </div>
        </div>

        <div className="status-toggle">
          <button onClick={() => handleStatusChange('non-cadre')} className={status === 'non-cadre' ? 'active' : ''}>Non-Cadre</button>
          <button onClick={() => handleStatusChange('cadre')} className={status === 'cadre' ? 'active' : ''}>Cadre</button>
        </div>
      </div>

      {results && (
        <div className="results-card">
          <h2>Résultats</h2>
          <div className="result-item">
            <span>Salaire Brut</span>
            <span>{formatCurrency(results.gross)}</span>
          </div>
          <div className="result-item">
            <span>Cotisations Sociales</span>
            <span className="negative">- {formatCurrency(results.contributions)}</span>
          </div>
          <div className="result-item bold">
            <span>Salaire Net avant impôt</span>
            <span>{formatCurrency(results.netBeforeTax)}</span>
          </div>
          <div className="result-item">
            <span>Impôt sur le revenu</span>
            <span className="negative">- {formatCurrency(results.tax)}</span>
          </div>
          <div className="result-item final">
            <span>Salaire Net après impôt</span>
            <span>{formatCurrency(results.netAfterTax)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
