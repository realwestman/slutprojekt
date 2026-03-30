const { useState } = React;

function StackedDivs() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="container">
      <div className="div-one">
        <h2 className="title">Ordnia</h2>
        <p>Håll koll på din ekonomi</p>
        <div className="budget-container">
          <div className="total-budget">
            <h4>Total budget</h4>
            <p className="total-amount">0,00 kr</p>
          </div>
          <div className="stat-row">
            <div className="stat-box income-box">
              <h4>Inkomst</h4>
              <p className="income-amount">0,00 kr</p>
            </div>
            <div className="stat-box expense-box">
              <h4>Utgift</h4>
              <p className="expense-amount">0,00 kr</p>
            </div>
          </div>
        </div>
      </div>

      <div className="div-two">
        <div className="add-post">
            <h2 className="title">Lägg till post</h2>
          <div className="type-buttons">
            <button
              className={`type-btn ${selected === 'inkomst' ? 'active-income' : ''}`}
              onClick={() => setSelected('inkomst')}
            >
              Inkomst
            </button>
            <button
              className={`type-btn ${selected === 'expenses' ? 'active-expense' : ''}`}
              onClick={() => setSelected('expenses')}
            >
              Utgift
            </button>
          </div>

          <div className="form-container">
            <input type="text" placeholder="Titel" className="form-input" />
            <input type="number" placeholder="Belopp" className="form-input" />
            <input type="text" placeholder="Kategori (valfritt)" className="form-input" />
            <button className="submit-btn">Lägg till</button>
          </div>
        </div>
      </div>

     <div className="div-three">
  <h2 className="title">Transaktioner</h2>
  <p className="no-transactions">Inga poster ännu. Lägg till din första transaktion.</p>
</div>
    </div>
  );
}

function App() {
  return (
    <>
      <StackedDivs />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);