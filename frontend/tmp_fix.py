# -*- coding: utf-8 -*-
from pathlib import Path
path = Path("src/App.jsx")
text = path.read_text()
needle = "const navLinks = ['Ana Sayfa', 'Müsait Saatler', 'Hizmetler', 'Ekibimiz', 'Iletisim']\n"
if needle not in text:
    raise SystemExit('needle not found')
text = text.replace(needle, needle + "  const [locale, setLocale] = useState('tr')\n", 1)
path.write_text(text)
