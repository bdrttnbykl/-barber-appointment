import { useEffect, useMemo, useState } from 'react'
import './App.css'
import logoPng from './assets/logo.png'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081'
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE ?? '0 (242) 000 00 00'
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? 'iletisim@barber.local'
const CONTACT_ADDRESS =
  import.meta.env.VITE_CONTACT_ADDRESS ?? 'Barber Mahallesi, 34. Sokak No:5, Istanbul'
const DAY_COUNT = 14
const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)
const formatPhoneDisplay = (value) => {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
  return parts.filter(Boolean).join(' ')
}

const formatDate = (date) => date.toISOString().split('T')[0]
const parseIsoDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const formatDisplayDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)

const formatDayLabel = (date) => {
  return new Intl.DateTimeFormat('tr-TR', { weekday: 'short' })
    .format(date)
    .replace('.', '')
    .trim()
}
const formatMonthDay = (date) => {
  const formatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })
  const [day, month] = formatter
    .format(date)
    .replace('.', '')
    .split(' ')
    .filter(Boolean)
  return `${day} ${month}`
}

function useUpcomingDays() {
  return useMemo(() => {
    const days = []
    const start = new Date()
    for (let i = 0; i < DAY_COUNT; i++) {
      const next = new Date(start)
      next.setDate(start.getDate() + i)
      days.push(next)
    }
    return days
  }, [])
}

function App() {
  const navLinks = ['Ana Sayfa', 'Müsait Saatler', 'Hizmetler', 'Ekibimiz', 'İletişim']

  const days = useUpcomingDays()
  const [selectedDate, setSelectedDate] = useState(formatDate(days[0]))
  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [services, setServices] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  })
  const [activeView, setActiveView] = useState('customer')
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('BUSINESS_TOKEN') ?? '')
  const [adminLogin, setAdminLogin] = useState({ username: '', password: '' })
  const [adminDate, setAdminDate] = useState(formatDate(new Date()))
  const [adminAppointments, setAdminAppointments] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminNotice, setAdminNotice] = useState(null)
  const [customerPhoneInput, setCustomerPhoneInput] = useState('')
  const [customerPhoneAuth, setCustomerPhoneAuth] = useState('')
  const [customerAppointments, setCustomerAppointments] = useState([])
  const [customerNotice, setCustomerNotice] = useState(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerEditTarget, setCustomerEditTarget] = useState(null)
  const [customerEditMode, setCustomerEditMode] = useState(null)
  const [customerEditServiceId, setCustomerEditServiceId] = useState('')
  const [customerEditDate, setCustomerEditDate] = useState('')
  const [customerEditSlot, setCustomerEditSlot] = useState('')
  const [customerEditSlots, setCustomerEditSlots] = useState([])
  const [customerEditLoading, setCustomerEditLoading] = useState(false)

  const resetCustomerEdit = () => {
    setCustomerEditTarget(null)
    setCustomerEditMode(null)
    setCustomerEditServiceId('')
    setCustomerEditDate('')
    setCustomerEditSlot('')
    setCustomerEditSlots([])
    setCustomerEditLoading(false)
  }

  const loadAvailability = (dateValue) => {
    if (!dateValue) {
      setAvailability([])
      setSelectedSlot(null)
      setAvailabilityLoading(false)
      return
    }

    setAvailabilityLoading(true)
    setSelectedSlot(null)
    fetch(`${API_BASE}/api/availability?date=${dateValue}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.slots ?? []))
      .catch(() =>
        setNotification({
          type: 'error',
          message: 'Müsaitlik bilgisi alinamadi. Lütfen tekrar deneyin.'
        })
      )
      .finally(() => setAvailabilityLoading(false))
  }

  useEffect(() => {
    setCurrentStep((prev) => (prev > 1 ? 1 : prev))
    loadAvailability(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    setServiceLoading(true)
    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() =>
        setNotification({
          type: 'error',
          message: 'Hizmet listesi yüklenemedi.'
        })
      )
      .finally(() => setServiceLoading(false))
  }, [])

  useEffect(() => {
    if (activeView === 'admin' && adminToken) {
      fetchAdminAppointments(adminDate)
    }
  }, [activeView, adminToken, adminDate])

  const availableCount = availability.filter((slot) => slot.available).length

  const continueFromDate = () => {
    if (!selectedDate) {
      setNotification({ type: 'error', message: 'Lütfen bir tarih seçin.' })
      return
    }
    if (availabilityLoading) {
      setNotification({
        type: 'error',
        message: 'Slotlar yükleniyor, lütfen bekleyin.'
      })
      return
    }
    setNotification(null)
    setCurrentStep(2)
  }

  const continueFromTime = () => {
    if (!selectedSlot) {
      setNotification({ type: 'error', message: 'Lütfen bir saat seçin.' })
      return
    }
    setNotification(null)
    setCurrentStep(3)
  }

  const continueFromService = () => {
    if (!selectedService) {
      setNotification({ type: 'error', message: 'Lütfen bir hizmet seçin.' })
      return
    }
    setNotification(null)
    setCurrentStep(4)
  }

  const handleAppointmentCreate = (event) => {
    event.preventDefault()
    setNotification(null)

    if (!selectedDate || !selectedSlot || !selectedService) {
      setNotification({
        type: 'error',
        message: 'Lütfen önce tarih, saat ve hizmet seçin.'
      })
      return
    }
    if (!form.customerName || !form.customerPhone) {
      setNotification({
        type: 'error',
        message: 'Ad ve telefon alanlari zorunludur.'
      })
      return
    }
    if (form.customerPhone.length !== 10) {
      setNotification({
        type: 'error',
        message: 'Telefon numarasi 10 haneli olmalidir.'
      })
      return
    }

    setIsSubmitting(true)
    fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        serviceId: selectedService?.id,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'An error occurred.')
        }
        return res.json()
      })
      .then(() => {
        setNotification({
          type: 'success',
          message: 'Randevu olusturuldu!'
        })
        loadAvailability(selectedDate)
        setCurrentStep(1)
        setSelectedSlot(null)
        setSelectedService(null)
        setForm({ customerName: '', customerPhone: '', customerEmail: '' })
      })
      .catch((err) => {
        setNotification({
          type: 'error',
          message:
            err.message?.includes('aktif bir randevu')
              ? 'Bu telefon numarasi için zaten aktif bir randevu var. Mevcut randevuyu iptal edin veya tarihini degistirin.'
              : err.message || 'Randevu olusturulamadi. Lütfen tekrar deneyin.'
        })
      })
      .finally(() => setIsSubmitting(false))
  }

  const fetchAdminAppointments = (dateValue = adminDate) => {
    if (!adminToken) return
    setAdminLoading(true)
    fetch(`${API_BASE}/api/appointments?date=${dateValue}`, {
      headers: {
        'X-Business-Token': adminToken
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Randevular yüklenemedi.')
        }
        return res.json()
      })
      .then((data) => {
        setAdminAppointments(data)
        setAdminNotice(null)
      })
      .catch((err) =>
        setAdminNotice({
          type: 'error',
          message: err.message || 'Randevular yüklenemedi.'
        })
      )
      .finally(() => setAdminLoading(false))
  }

  const handleAdminLogin = (event) => {
    event.preventDefault()
    setAdminNotice(null)
    fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminLogin)
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Giris basarisiz.')
        }
        return res.json()
      })
      .then((data) => {
        setAdminToken(data.token)
        localStorage.setItem('BUSINESS_TOKEN', data.token)
        setAdminNotice({ type: 'success', message: 'Giris yapildi.' })
        fetchAdminAppointments(adminDate)
      })
      .catch((err) =>
        setAdminNotice({
          type: 'error',
          message: err.message || 'Giris basarisiz.'
        })
      )
  }

  const handleAdminLogout = () => {
    fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: { 'X-Business-Token': adminToken }
    }).finally(() => {
      setAdminToken('')
      localStorage.removeItem('BUSINESS_TOKEN')
      setAdminAppointments([])
      setAdminNotice({ type: 'success', message: 'Çikis yapildi.' })
    })
  }

  const handleCancelAppointment = (id) => {
    if (!adminToken) return
    const confirmCancel = window.confirm('Bu randevuyu iptal etmek istediginize emin misiniz?')
    if (!confirmCancel) return
    fetch(`${API_BASE}/api/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'X-Business-Token': adminToken }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Randevu iptal edilemedi.')
        }
        setAdminNotice({ type: 'success', message: 'Randevu iptal edildi.' })
        fetchAdminAppointments(adminDate)
      })
      .catch((err) =>
        setAdminNotice({
          type: 'error',
          message: err.message || 'Randevu iptal edilemedi.'
        })
      )
  }

  const fetchCustomerAppointments = (phone) => {
    setCustomerLoading(true)
    fetch(`${API_BASE}/api/customer/appointments?phone=${phone}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Randevular alinamadi.')
        }
        return res.json()
      })
      .then((data) => {
        setCustomerPhoneAuth(phone)
        setCustomerAppointments(data)
        setCustomerNotice({
          type: 'success',
          message: data.length ? 'Randevular yüklendi.' : 'Aktif randevunuz bulunmuyor.'
        })
        resetCustomerEdit()
      })
      .catch((err) =>
        setCustomerNotice({
          type: 'error',
          message: err.message || 'Randevular alinamadi.'
        })
      )
      .finally(() => setCustomerLoading(false))
  }

  const handleCustomerLogin = (event) => {
    event.preventDefault()
    const normalized = normalizePhone(customerPhoneInput)
    if (normalized.length !== 10) {
      setCustomerNotice({ type: 'error', message: 'Telefon numarasi 10 haneli olmalidir.' })
      return
    }
    fetchCustomerAppointments(normalized)
  }

  const handleCustomerLogout = () => {
    setCustomerPhoneAuth('')
    setCustomerPhoneInput('')
    setCustomerAppointments([])
    setCustomerNotice(null)
    resetCustomerEdit()
  }

  const handleCustomerCancel = (id) => {
    if (!customerPhoneAuth) return
    const confirmed = window.confirm('Bu randevuyu iptal etmek istiyor musunuz?')
    if (!confirmed) return
    setCustomerNotice(null)
    fetch(`${API_BASE}/api/customer/appointments/${id}?phone=${customerPhoneAuth}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Randevu iptal edilemedi.')
        }
        setCustomerNotice({ type: 'success', message: 'Randevu iptal edildi.' })
        if (customerEditTarget?.id === id) {
          resetCustomerEdit()
        }
        fetchCustomerAppointments(customerPhoneAuth)
      })
      .catch((err) =>
        setCustomerNotice({
          type: 'error',
          message: err.message || 'Randevu iptal edilemedi.'
        })
      )
  }

  const fetchEditSlots = (dateValue, currentSlotOverride = customerEditTarget?.appointmentTime ?? '') => {
    if (!dateValue) {
      setCustomerEditSlots([])
      setCustomerEditSlot('')
      return
    }
    setCustomerEditLoading(true)
    fetch(`${API_BASE}/api/availability?date=${dateValue}`)
      .then((res) => res.json())
      .then((data) => {
        const slots = (data.slots ?? []).filter((slot) => slot.available).map((slot) => slot.time)
        if (
          currentSlotOverride &&
          customerEditTarget?.appointmentDate === dateValue &&
          !slots.includes(currentSlotOverride)
        ) {
          slots.push(currentSlotOverride)
        }
        setCustomerEditSlots(slots)
        if (currentSlotOverride && slots.includes(currentSlotOverride)) {
          setCustomerEditSlot(currentSlotOverride)
        } else {
          setCustomerEditSlot('')
        }
      })
      .catch(() =>
        setCustomerNotice({
          type: 'error',
          message: 'Müsaitlik bilgisi alinamadi.'
        })
      )
      .finally(() => setCustomerEditLoading(false))
  }

  const startCustomerEdit = (appointment) => {
    setCustomerEditTarget(appointment)
    setCustomerEditMode(null)
    setCustomerEditServiceId(appointment?.serviceId ? String(appointment.serviceId) : '')
    setCustomerEditDate(appointment?.appointmentDate ?? '')
    setCustomerEditSlot(appointment?.appointmentTime ?? '')
    setCustomerEditSlots([])
    setCustomerNotice(null)
  }

  const chooseCustomerEditMode = (mode) => {
    if (!customerEditTarget) return
    setCustomerEditMode(mode)
    if (mode === 'service') {
      setCustomerEditServiceId(customerEditTarget.serviceId ? String(customerEditTarget.serviceId) : '')
    } else if (mode === 'datetime') {
      const dateValue = customerEditTarget.appointmentDate ?? formatDate(new Date())
      const slotValue = customerEditTarget.appointmentTime ?? ''
      setCustomerEditDate(dateValue)
      setCustomerEditSlot(slotValue)
      fetchEditSlots(dateValue, slotValue)
    }
  }

  const handleCustomerServiceUpdate = (event) => {
    event.preventDefault()
    if (!customerEditTarget || !customerPhoneAuth) return
    if (!customerEditServiceId) {
      setCustomerNotice({ type: 'error', message: 'Lütfen bir hizmet seçin.' })
      return
    }
    setCustomerEditLoading(true)
    fetch(
      `${API_BASE}/api/customer/appointments/${customerEditTarget.id}/service?phone=${customerPhoneAuth}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: Number(customerEditServiceId) })
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Hizmet güncellenemedi.')
        }
        return res.json()
      })
      .then(() => {
        setCustomerNotice({ type: 'success', message: 'Hizmet güncellendi.' })
        fetchCustomerAppointments(customerPhoneAuth)
        resetCustomerEdit()
      })
      .catch((err) =>
        setCustomerNotice({
          type: 'error',
          message: err.message || 'Hizmet güncellenemedi.'
        })
      )
      .finally(() => setCustomerEditLoading(false))
  }

  const handleCustomerScheduleUpdate = (event) => {
    event.preventDefault()
    if (!customerEditTarget || !customerPhoneAuth) return
    if (!customerEditDate || !customerEditSlot) {
      setCustomerNotice({ type: 'error', message: 'Lütfen tarih ve saat seçin.' })
      return
    }
    setCustomerEditLoading(true)
    fetch(
      `${API_BASE}/api/customer/appointments/${customerEditTarget.id}/slot?phone=${customerPhoneAuth}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: customerEditDate,
          appointmentTime: customerEditSlot
        })
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Tarih güncellenemedi.')
        }
        return res.json()
      })
      .then(() => {
        setCustomerNotice({ type: 'success', message: 'Tarih güncellendi.' })
        fetchCustomerAppointments(customerPhoneAuth)
        resetCustomerEdit()
      })
      .catch((err) =>
        setCustomerNotice({
          type: 'error',
          message: err.message || 'Tarih güncellenemedi.'
        })
      )
      .finally(() => setCustomerEditLoading(false))
  }

  const selectedDateLabel = selectedDate
    ? formatDisplayDate(parseIsoDate(selectedDate))
    : 'Tarih seçilmedi'
  const prettyPhone = formatPhoneDisplay(form.customerPhone)
  const dateReady = Boolean(selectedDate)
  const timeReady = currentStep > 2 && Boolean(selectedSlot)
  const serviceReady = currentStep > 3 && Boolean(selectedService)
  const customerReady = Boolean(form.customerName && form.customerPhone.length === 10)
  const dateBackLabel = selectedDate ? 'Sil' : 'Geri'
  const timeBackLabel = selectedSlot ? 'Sil' : 'Geri'
  const serviceBackLabel = selectedService ? 'Sil' : 'Geri'
  const [showSplash, setShowSplash] = useState(true)
  const handleDateBack = () => {
    if (selectedDate) {
      setSelectedDate(null)
      setAvailability([])
      setSelectedSlot(null)
      setAvailabilityLoading(false)
    }
  }
  const handleTimeBack = () => {
    if (selectedSlot) {
      setSelectedSlot(null)
      return
    }
    setCurrentStep(1)
  }
  const handleServiceBack = () => {
    if (selectedService) {
      setSelectedService(null)
      return
    }
    setCurrentStep(2)
  }

  const stepStatus = (step) => {
    if (currentStep === step) return 'current'
    if (currentStep > step) return 'complete'
    return 'upcoming'
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="page-shell">
      {showSplash && (
        <div className="splash-screen">
          <div className="splash-content">
            <p className="splash-topline">Berber</p>
            <h1>Booking</h1>
            <p className="splash-subline">Premium</p>
            <img src={logoPng} alt="Berber Booking Logo" className="splash-logo" />
            <div className="splash-progress">
              <div className="splash-progress-bar" />
            </div>
            <div className="splash-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="splash-loading">Yükleniyor...</p>
          </div>
        </div>
      )}
      <header className="top-bar">
        <div className="brand-mark">
          <div className="brand-icon">BB</div>
          <div>
            <p className="brand-title">Berber Booking</p>
            <small>Randevu Sistemi</small>
          </div>
        </div>
        <nav className="nav-links">
          {navLinks.map((link) => (
            <button key={link} type="button" className="nav-link">
              {link}
            </button>
          ))}
        </nav>
        <button className="cta-button">Randevu Al</button>
      </header>
      <div className="app-shell">
        <div className="view-switch">
        <button
          className={activeView === 'customer' ? 'active' : ''}
          onClick={() => setActiveView('customer')}
        >
          Müsteri Rezervasyonu
        </button>
        <button
          className={activeView === 'admin' ? 'active' : ''}
          onClick={() => setActiveView('admin')}
        >
          Isletme Paneli
        </button>
      </div>
      {activeView === 'customer' ? (
        <div className="booking-layout">
          <header className="booking-hero">
            <div className="hero-copy">
              <img src={logoPng} alt="Barber Booking Logo" className="brand-logo" />
              <h1>Randevunuzu Olusturun</h1>
              <p>Istediginiz tarih, saat ve hizmeti seçerek randevu olusturun.</p>
            </div>
            <div className="hero-illustration" aria-hidden="true">
              <svg className="hero-circle" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="heroCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe6b4" />
                    <stop offset="100%" stopColor="#f2b544" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="url(#heroCircleGradient)" opacity="0.35" />
              </svg>
              <svg className="hero-lines" viewBox="0 0 260 160" preserveAspectRatio="none">
                <path d="M0 120 C40 100 80 140 120 110 C160 80 200 130 240 100" />
                <path d="M0 80 C40 60 80 110 120 80 C160 50 200 100 240 70" />
              </svg>
              <svg className="hero-icon" viewBox="0 0 64 32">
                <path d="M4 20c6-8 18-8 24 0c6-8 18-8 24 0" />
                <circle cx="20" cy="16" r="3" />
                <circle cx="44" cy="16" r="3" />
              </svg>
            </div>
          </header>

          <div className="booking-flow">
            <div className="flow-steps">
              <StepSection
        number={1}
        title="Tarih Seç"
        status={stepStatus(1)}
        summary={currentStep > 1 ? selectedDateLabel : undefined}
        onChange={() => setCurrentStep(1)}
      >
        <div className="date-grid">
          {days.map((day) => {
            const iso = formatDate(day)
            const isSelected = iso === selectedDate
            return (
              <button
                key={iso}
                className={`date-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(iso)}
              >
                <span className="weekday">{formatDayLabel(day)}</span>
                <span className="day">{formatMonthDay(day)}</span>
                <span
                  className={`availability ${
                    iso === selectedDate && !availabilityLoading
                      ? availableCount > 6
                        ? 'plenty'
                        : 'low'
                      : ''
                  }`}
                >
                  {iso === selectedDate
                    ? availabilityLoading
                      ? 'Yükleniyor...'
                      : availableCount > 6
                        ? `${availableCount} müsait`
                        : 'Az yer'
                    : ''}
                </span>
              </button>
            )
          })}
        </div>
        <div className="selection-summary">
          Seçilen tarih: {selectedDateLabel}
        </div>
        <div className="actions">
          <button className="secondary" onClick={handleDateBack} disabled={!selectedDate}>
            {dateBackLabel}
          </button>
          <button onClick={continueFromDate} disabled={!selectedDate}>
            Devam
          </button>
        </div>
      </StepSection>

              <StepSection
        number={2}
        title="Saat Seç"
        status={stepStatus(2)}
        summary={currentStep > 2 ? selectedSlot : undefined}
        onChange={() => setCurrentStep(2)}
      >
        {availabilityLoading ? (
          <p className="muted">Slotlar yükleniyor...</p>
        ) : availability.length === 0 ? (
          <p className="muted">Bu tarih için slot bilgisi alinamadi.</p>
        ) : (
          <>
            {availableCount === 0 && (
              <p className="muted">Bu tarih için tüm saatler dolu.</p>
            )}
            <div className="slot-grid">
              {availability.map((slot) => {
                const disabled = !slot.available
                const isSelected = selectedSlot === slot.time
                return (
                  <button
                    key={slot.time}
                    disabled={disabled}
                    className={`slot ${isSelected ? 'selected' : ''} ${
                      disabled ? 'booked' : ''
                    }`}
                    onClick={() => setSelectedSlot(slot.time)}
                  >
                    <span>{slot.time}</span>
                    {disabled && <span class="sr-only">Dolu</span>}
                  </button>
                )
              })}
            </div>
          </>
        )}
        <div className="actions">
          <button className="secondary" onClick={handleTimeBack}>
            {timeBackLabel}
          </button>
          <button onClick={continueFromTime}>Devam</button>
        </div>
      </StepSection>

              <StepSection
        number={3}
        title="Hizmet Seç"
        status={stepStatus(3)}
        summary={
          currentStep > 3 && selectedService
            ? `${selectedService.name} - ${selectedService.price} ₺`
            : undefined
        }
        onChange={() => setCurrentStep(3)}
      >
        {serviceLoading ? (
          <p className="muted">Loading services...</p>
        ) : (
          <div className="service-list">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id
              return (
                <button
                  key={service.id}
                  className={`service-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <div>
                    <h4>{service.name}</h4>
                    {service.description && <p>{service.description}</p>}
                  </div>
                  <span className="price">{service.price} ₺</span>
                </button>
              )
            })}
          </div>
        )}
        <div className="actions">
          <button className="secondary" onClick={handleServiceBack}>
            {serviceBackLabel}
          </button>
          <button onClick={continueFromService}>Devam</button>
        </div>
      </StepSection>

              <StepSection
        number={4}
        title="Bilgileriniz"
        status={stepStatus(4)}
        onChange={() => setCurrentStep(4)}
      >
        <form className="info-form" onSubmit={handleAppointmentCreate}>
          <label>
            Ad Soyad*
            <input
              type="text"
              value={form.customerName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, customerName: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Telefon*
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              title="Lütfen 10 haneli bir numara girin"
              maxLength={10}
              value={form.customerPhone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  customerPhone: normalizePhone(e.target.value)
                }))
              }
              placeholder="5XX XXX XX XX"
              required
            />
          </label>
          <label>
            E-posta (opsiyonel)
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, customerEmail: e.target.value }))
              }
            />
          </label>
          <div className="actions">
            <button className="secondary" type="button" onClick={() => setCurrentStep(3)}>
              Back
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </StepSection>
      {notification && (
        <div className={`notice form-notice ${notification.type}`}>{notification.message}</div>
      )}

            </div>
            <BookingSummary
              dateLabel={selectedDateLabel}
              dateReady={dateReady}
              timeLabel={selectedSlot}
              timeReady={timeReady}
              service={selectedService}
              serviceReady={serviceReady}
              customer={{
                name: form.customerName,
                phone: prettyPhone,
                email: form.customerEmail
              }}
              customerReady={customerReady}
            />
          </div>

          <section className="customer-manage">
            <h2>Randevunuzu Yönetin</h2>
            <p>Telefon numaranizla giris yaparak mevcut randevularinizi görüntüleyebilir ve iptal edebilirsiniz.</p>
            {customerNotice && (
              <div className={`notice ${customerNotice.type}`}>{customerNotice.message}</div>
            )}
            {customerPhoneAuth ? (
              <>
                <div className="customer-manage-header">
                  <span>Giris yaptiginiz numara: {customerPhoneAuth}</span>
                  <button onClick={handleCustomerLogout}>Çikis Yap</button>
                </div>
                {customerLoading ? (
                  <p className="muted">Randevular yükleniyor...</p>
                ) : customerAppointments.length === 0 ? (
                  <p className="muted">Aktif randevunuz bulunmuyor.</p>
                ) : (
                  <div className="customer-appointment-list">
                    {customerAppointments.map((appt) => (
                      <div key={appt.id}>
                        <div className="customer-appointment-card">
                          <div>
                            <strong>
                              {appt.appointmentDate} {appt.appointmentTime}
                            </strong>
                            <p>{appt.serviceName}</p>
                          </div>
                          <div className="customer-appointment-actions">
                            <button className="edit-btn" onClick={() => startCustomerEdit(appt)}>
                              Düzenle
                            </button>
                            <button className="danger-btn" onClick={() => handleCustomerCancel(appt.id)}>
                              Iptal Et
                            </button>
                          </div>
                        </div>
                        {customerEditTarget?.id === appt.id && (
                          <div className="customer-edit-panel">
                            {!customerEditMode ? (
                              <>
                                <p>Ne düzenlemek istersiniz?</p>
                                <div className="customer-edit-actions">
                                  <button
                                    className="edit-btn"
                                    onClick={() => chooseCustomerEditMode('service')}
                                  >
                                    Hizmeti Düzenle
                                  </button>
                                  <button
                                    className="edit-btn"
                                    onClick={() => chooseCustomerEditMode('datetime')}
                                  >
                                    Tarih/Saat Düzenle
                                  </button>
                                </div>
                                <button className="text-button" onClick={resetCustomerEdit}>
                                  Kapat
                                </button>
                              </>
                            ) : customerEditMode === 'service' ? (
                              <form className="customer-edit-form" onSubmit={handleCustomerServiceUpdate}>
                                <label>
                                  Hizmet Seçin
                                  <select
                                    value={customerEditServiceId}
                                    onChange={(e) => setCustomerEditServiceId(e.target.value)}
                                  >
                                    <option value="">Hizmet seçin</option>
                                    {services.map((service) => (
                                      <option key={service.id} value={service.id}>
                                        {service.name} - {service.price} ₺
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <div className="customer-edit-actions">
                                  <button type="button" className="secondary" onClick={() => setCustomerEditMode(null)}>
                                    Geri
                                  </button>
                                  <button type="submit" disabled={customerEditLoading}>
                                    {customerEditLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <form className="customer-edit-form" onSubmit={handleCustomerScheduleUpdate}>
                                <label>
                                  Tarih
                                  <input
                                    type="date"
                                    value={customerEditDate}
                                    onChange={(e) => {
                                      setCustomerEditDate(e.target.value)
                                      fetchEditSlots(e.target.value)
                                    }}
                                    required
                                  />
                                </label>
                                <div className="slot-grid edit-slots">
                                  {customerEditLoading ? (
                                    <p className="muted">Müsaitlik yükleniyor...</p>
                                  ) : customerEditSlots.length === 0 ? (
                                    <p className="muted">Bu tarih için uygun saat bulunamadi.</p>
                                  ) : (
                                    customerEditSlots.map((time) => (
                                      <button
                                        type="button"
                                        key={time}
                                        className={`slot ${customerEditSlot === time ? 'selected' : ''}`}
                                        onClick={() => setCustomerEditSlot(time)}
                                      >
                                        {time}
                                      </button>
                                    ))
                                  )}
                                </div>
                                <div className="customer-edit-actions">
                                  <button type="button" className="secondary" onClick={() => setCustomerEditMode(null)}>
                                    Geri
                                  </button>
                                  <button type="submit" disabled={customerEditLoading}>
                                    {customerEditLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form className="customer-manage-form" onSubmit={handleCustomerLogin}>
                <label>
                  Telefon Numaraniz
                  <input
                    type="tel"
                    value={customerPhoneInput}
                    onChange={(e) => setCustomerPhoneInput(normalizePhone(e.target.value))}
                    placeholder="5XX XXX XX XX"
                    maxLength={10}
                    inputMode="numeric"
                    required
                  />
                </label>
                <div className="actions">
                  <button type="submit" disabled={customerLoading}>
                    {customerLoading ? 'Kontrol ediliyor...' : 'Randevularimi Göster'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : (
        <div className="admin-panel">
          {adminToken ? (
            <>
              <div className="admin-header">
                <div>
                  <h1>Isletme Paneli</h1>
                  <p className="muted">Randevularinizi görüntüleyin ve yönetin.</p>
                </div>
                <button onClick={handleAdminLogout}>
                  Çikis Yap
                </button>
              </div>

              {adminNotice && (
                <div className={`notice ${adminNotice.type}`}>{adminNotice.message}</div>
              )}

              <div className="admin-filters">
                <label>
                  Tarih
                  <input
                    type="date"
                    value={adminDate}
                    onChange={(e) => setAdminDate(e.target.value)}
                  />
                </label>
                <button onClick={() => fetchAdminAppointments(adminDate)}>Yenile</button>
              </div>

              {adminLoading ? (
                <p className="muted">Randevular yükleniyor...</p>
              ) : adminAppointments.length === 0 ? (
                <p className="muted">Bu tarih için randevu bulunmuyor.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Saat</th>
                        <th>Müsteri</th>
                        <th>Telefon</th>
                        <th>Hizmet</th>
                        <th>Islem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAppointments.map((appt) => (
                        <tr key={appt.id}>
                          <td>
                            {appt.appointmentDate} {appt.appointmentTime}
                          </td>
                          <td>{appt.customerName}</td>
                          <td>{appt.customerPhone}</td>
                          <td>
                            {appt.serviceName}
                            {appt.servicePrice ? ` - ${appt.servicePrice} ₺` : ''}
                          </td>
                          <td>
                            <button onClick={() => handleCancelAppointment(appt.id)}>
                              Iptal Et
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="admin-login-card">
              <h1>Isletme Paneli</h1>
              <p className="muted">Giris yaptiktan sonra randevulari yönetebilirsiniz.</p>
              {adminNotice && (
                <div className={`notice ${adminNotice.type}`}>{adminNotice.message}</div>
              )}
              <form className="admin-login-form" onSubmit={handleAdminLogin}>
                <label>
                  Kullanici Adi
                  <input
                    type="email"
                    value={adminLogin.username}
                    onChange={(e) =>
                      setAdminLogin((prev) => ({ ...prev, username: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Sifre
                  <input
                    type="password"
                    value={adminLogin.password}
                    onChange={(e) =>
                      setAdminLogin((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                </label>
                <button type="submit">Giris Yap</button>
              </form>
            </div>
          )}
        </div>
      )}
      <footer className="app-footer">
        <h3>Iletisim</h3>
        <div className="contact-cards">
          <article className="contact-card">
            <div className="contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 17.47c-2.15-2.87-5-7.39-5-10.47 0-2.76 2.24-5 5-5s5 2.24 5 5c0 3.08-2.85 7.6-5 10.47z"></path>
                <circle cx="12" cy="9" r="2.5"></circle>
              </svg>
            </div>
            <div className="contact-content">
              <span className="label">Adres</span>
              <strong>{CONTACT_ADDRESS}</strong>
            </div>
          </article>
          <article className="contact-card">
            <div className="contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 01.96-.26 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1C10.84 21 3 13.16 3 3a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.26.96z"></path>
              </svg>
            </div>
            <div className="contact-content">
              <span className="label">Telefon</span>
              <a href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, '')}`}>{CONTACT_PHONE}</a>
            </div>
          </article>
          <article className="contact-card">
            <div className="contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5z"></path>
              </svg>
            </div>
            <div className="contact-content">
              <span className="label">E-posta</span>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
          </article>
        </div>
        <div className="footer-illustration" aria-hidden="true">
          <svg viewBox="0 0 800 120" preserveAspectRatio="none">
            <path
              d="M0 40 L50 30 C120 10 180 60 250 50 C320 40 380 10 450 40 C520 70 580 40 650 30 C710 22 760 45 800 30 L800 120 L0 120 Z"
            />
          </svg>
        </div>
      </footer>
    </div>
  </div>
  )
}

const BookingSummary = ({
  dateLabel,
  dateReady,
  timeLabel,
  timeReady,
  service,
  serviceReady,
  customer,
  customerReady
}) => (
  <aside className="booking-summary">
    <div className="summary-header">
      <h3>Randevu Özeti</h3>
      <p className="muted">Adimlari tamamladikça otomatik güncellenir.</p>
    </div>
    <div className="summary-list">
      <div className={`summary-item ${dateReady ? 'ready' : ''}`}>
        <span className="summary-label">1. Tarih</span>
        <strong>{dateLabel}</strong>
        <small>{dateReady ? 'Onaylandi' : 'Tarihi seçip devam edin.'}</small>
      </div>
      <div className={`summary-item ${timeReady ? 'ready' : ''}`}>
        <span className="summary-label">2. Saat</span>
        <strong>{timeLabel || 'Saat seçin'}</strong>
        <small>{timeReady ? 'Saat kaydedildi.' : 'Saat seçimi bu alanda görünür.'}</small>
      </div>
      <div className={`summary-item ${serviceReady ? 'ready' : ''}`}>
        <span className="summary-label">3. Hizmet</span>
        {service ? (
          <>
            <strong>{service.name}</strong>
            {service.price && <small>{service.price} TL</small>}
          </>
        ) : (
          <>
            <strong>Hizmet seçin</strong>
            <small>Hizmet adi ve ücreti burada görünür.</small>
          </>
        )}
      </div>
      <div className={`summary-item ${customerReady ? 'ready' : ''}`}>
        <span className="summary-label">4. Iletisim</span>
        {customerReady ? (
          <>
            <strong>{customer.name}</strong>
            {customer.phone && <small>{customer.phone}</small>}
            {customer.email && <small>{customer.email}</small>}
          </>
        ) : (
          <>
            <strong>Bilgilerinizi girin</strong>
            <small>Ad ve telefon eklendiginde burada görünür.</small>
          </>
        )}
      </div>
    </div>
    <p className="summary-note">
      {customerReady
        ? 'Tüm adimlar hazir – randevuyu olusturabilirsiniz.'
        : 'Randevunuzu tamamlamak için adimlara devam edin.'}
    </p>
  </aside>
 )

const StepSection = ({ number, title, status, summary, onChange, children }) => (
  <section className={`step ${status}`}>
    <div className="step-title">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        {summary && <p className="summary muted">{summary}</p>}
      </div>
      {status === 'complete' && (
        <button className="text-button" onClick={onChange}>
          Degistir
        </button>
      )}
      {status === 'upcoming' && summary && (
        <button className="text-button" onClick={onChange}>
          Düzenle
        </button>
      )}
    </div>
    {status === 'current' ? children : null}
  </section>
)

export default App
















