# -*- coding: utf-8 -*-
from pathlib import Path
path = Path("src/App.jsx")
text = path.read_text(encoding='utf-8')
old = "  useEffect(() => {\n    setCurrentStep((prev) => (prev > 1 ? 1 : prev))\n    if (!selectedDate) {\n      setAvailability([])\n      setSelectedSlot(null)\n      setAvailabilityLoading(false)\n      return\n    }\n    setAvailabilityLoading(true)\n    setSelectedSlot(null)\n    fetch(`${API_BASE}/api/availability?date=${selectedDate}`)\n      .then((res) => res.json())\n      .then((data) => setAvailability(data.slots ?? []))\n      .catch(() =>\n        setNotification({\n          type: 'error',\n          message: 'Müsaitlik bilgisi alinamadi. Lütfen tekrar deneyin.'\n        })\n      )\n      .finally(() => setAvailabilityLoading(false))\n  }, [selectedDate])\n\n"
new = "  const loadAvailability = (date) => {\n    setCurrentStep((prev) => (prev > 1 ? 1 : prev))\n    if (!date) {\n      setAvailability([])\n      setSelectedSlot(null)\n      setAvailabilityLoading(false)\n      return\n    }\n    setAvailabilityLoading(true)\n    setSelectedSlot(null)\n    fetch(`${API_BASE}/api/availability?date=${date}`)\n      .then((res) => res.json())\n      .then((data) => setAvailability(data.slots ?? []))\n      .catch(() =>\n        setNotification({\n          type: 'error',\n          message: 'Müsaitlik bilgisi alinamadi. Lütfen tekrar deneyin.'\n        })\n      )\n      .finally(() => setAvailabilityLoading(false))\n  }\n\n  useEffect(() => {\n    loadAvailability(selectedDate)\n  }, [selectedDate])\n\n"
if old not in text:
    raise SystemExit('target block not found')
text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
