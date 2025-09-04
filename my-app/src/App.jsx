import UserDetailsForm from './components/UserDetailsForm.jsx'
import './App.css'

function App() {
  return (
    <>
      <div className="logo-container">
        <img 
          src="https://upload.wikimedia.org/wikipedia/he/thumb/1/14/Israel_Post.svg/308px-Israel_Post.svg.png?20211125182352"
          alt="לוגו"
          className="logo"
        />
      </div>
      <h1 dir="rtl">פרטי תשלום</h1>
      <p className="subtitle" dir="rtl">אנא מלא/י את פרטיך לביצוע התשלום</p>
      <div className="payment-reason" dir="rtl">
        <span className="reason-text">שירותי דואר ישראל - מכס חבילה- ג311</span>
      </div>
      <div className="amount-summary" dir="rtl">
        <span>סכום לתשלום: </span>
        <span className="amount-value">₪9.00</span>
      </div>
      <UserDetailsForm />
    </>
  )
}

export default App
