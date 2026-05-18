const { useState, useEffect, useRef } = React;
const { Button, Modal, Box, Typography} = MaterialUI;

function BudgetChart({ income, expense }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Inkomst', 'Utgift'],
        datasets: [{ data: [income, expense], backgroundColor: ['#4caf50', '#f44336'], borderWidth: 0 }]
      },
      options: { plugins: { legend: { labels: { color: 'grey' } } } }
    });
  }, [income, expense]);

  return <canvas ref={canvasRef} width="300" height="300" />;
}

function StackedDivs() {
  const [selected, setSelected] = useState();
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('budget')) || 0);
  const [inputValue, setInputValue] = useState("");
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions'); 
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const listPosts = transactions.map((t, index) =>
        <div key={t.id} 
        className="transaction-card" 
        onClick={() => openModal(index)}>

          <div className="left">
          <p className="t-title">{t.title}</p>
          <p className="t-category">{t.category}</p>
          </div>

          <div className="right">
            <p className="t-amount">{t.type === "income" ? "+" : "-"} {t.amount} kr</p>
            <Button className={`badge ${t.type}`} variant="contained"> {t.type === 'income' ? 'Inkomst' : 'Utgift'}</Button>
          </div>
        </div>
  )

  function handleAdd() {
    const amount = Number(inputValue);
    if (!selected) { 
      alert('Vänligen välj inkomst eller utgift')
      return
    }
    const newTransaction = { 
      id: crypto.randomUUID(),
      type: selected, 
      amount, 
      title, 
      category };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    localStorage.setItem("budget", budget + (selected === 'income' ? amount : -amount));
    setBudget(prev => selected === 'income' ? prev + amount : prev - amount);
    setTitle("")
    setInputValue("")
    setCategory("")
  }

  function handleDelete() {
    if (selectedIndex === null) return;
    const transaction = transactions[selectedIndex];
    const newBudget = transaction.type === 'income' ? budget - transaction.amount : budget + transaction.amount;
    const newTransactions = transactions.filter((_, i) => i !== selectedIndex);
    setBudget(newBudget);
    setTransactions(newTransactions);
    localStorage.setItem("budget", newBudget);
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
  }

  function handleEdit() {
    if (selectedIndex === null) return;
    const old = transactions[selectedIndex];
    const amount = Number(editAmount);
    const newBudget = budget
      + (old.type === 'income' ? -old.amount : old.amount)
      + (old.type === 'income' ? amount : -amount);
    const updated = { type: old.type, amount, title: editTitle, category: editCategory };
    const newTransactions = transactions.map((t, i) => i === selectedIndex ? updated : t);
    setBudget(newBudget);
    setTransactions(newTransactions);
    localStorage.setItem("budget", newBudget);
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
    setOpen(false);
    setEditMode(false);
  }

  function handleClose() { 
    setOpen(false); 
    setEditMode(false); 
  }

  function handleConfirmDelete() { 
    handleDelete(); 
    setOpen(false); 
    setEditMode(false); 
  }

  function openModal(index) {
    const t = transactions[index];
    setSelectedIndex(index);
    setEditTitle(t.title);
    setEditAmount(t.amount);
    setEditCategory(t.category);
    setOpen(true);
  }

  return (
    <div className="container">
      <div className="div-one">
        <h2 className="title">Ordnia</h2>
        <p>Håll koll på din ekonomi</p>
        <div className="budget-container">
          <div className="total-budget">
            <h4>Total budget</h4>
            <p className="total-amount" style={{ color: budget < 0 ? 'red' : 'green' }}>{budget} kr</p>
          </div>
          <div className="stat-row">
            <div className="stat-box income-box"><h4>Inkomst</h4><p className="income-amount">{income} kr</p></div>
            <div className="stat-box expense-box"><h4>Utgift</h4><p className="expense-amount">{expense} kr</p></div>
          </div>
        </div>

        {transactions.length >= 1 && (
          <Button variant="contained" onClick={() => setShowChart(prev => !prev)} >
            {showChart ? 'Dölj diagram' : 'Visa diagram'}
          </Button>
        )}

        {showChart && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <BudgetChart income={income} expense={expense} />
          </Box>
        )}
      </div>

      <div className="div-two">
        <div className="add-post">
          <h2 className="title">Lägg till post</h2>
          <div className="type-buttons">
            <button className={`type-btn ${selected === 'income' ? 'active-income' : ''}`} onClick={() => setSelected('income')}>Inkomst</button>
            <button className={`type-btn ${selected === 'expense' ? 'active-expense' : ''}`} onClick={() => setSelected('expense')}>Utgift</button>
          </div>
          <div className="form-container">
            <input type="text" value={title} placeholder="Titel" className="form-input" onChange={e => setTitle(e.target.value)} />
            <input type="number" placeholder="Belopp" value={inputValue} className="form-input" onChange={e => { if (e.target.value >= 0) setInputValue(e.target.value); else alert('Vänlig skriv in en positiv siffra'); }} />
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Kategori (valfritt)" className="form-input" />
            <Button variant="contained" className="submit-btn" onClick={handleAdd}>Lägg till</Button>
          </div>
        </div>
      </div>

      <div className="div-three">
        <h2 className="title">Transaktioner</h2>
        {transactions.length === 0 ? (
          <p className="no-transactions">Inga poster ännu. Lägg till din första transaktion.</p>
        ) : (
          <div>{listPosts}</div>
        )}
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box className="box-modal">
          {editMode ? (
            <>
              <Typography variant="h6" sx={{ color: "white", mb: 2 }}>Redigera transaktion</Typography>
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titel" className="form-input" style={{ width: '100%', marginBottom: 8 }} />
              <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="Belopp" className="form-input" style={{ width: '100%', marginBottom: 8 }} />
              <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Kategori" className="form-input" style={{ width: '100%', marginBottom: 16 }} />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Button onClick={handleConfirmDelete} color="error" variant="contained">Ta bort</Button>
                <Button onClick={handleClose}>Avbryt</Button>
                <Button onClick={handleEdit} variant="contained">Spara</Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ color: "white" }}>Ta bort transaktion?</Typography>
              <Typography sx={{ mt: 2 }}>Är du säker på att du vill ta bort denna post?</Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Button onClick={handleConfirmDelete} color="error" variant="contained">Ta bort</Button>
                <Button onClick={() => setEditMode(true)} className="edit-btn">Redigera</Button>
                <Button onClick={handleClose}>Avbryt</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

function App() {
  return <StackedDivs/>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
