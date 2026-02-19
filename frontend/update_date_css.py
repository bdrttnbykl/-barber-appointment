from pathlib import Path
path = Path("src/App.css")
text = path.read_text(encoding='utf-8')
needle = ".date-card {\n  background: var(--white);\n  border: 1px solid var(--gray-200);\n  border-radius: 16px;\n  padding: 1rem;\n  text-align: center;\n  color: var(--black);\n}\n\n.date-card.selected {"
insert = ".date-card {\n  background: var(--white);\n  border: 1px solid var(--gray-200);\n  border-radius: 16px;\n  padding: 1rem;\n  text-align: center;\n  color: var(--black);\n}\n.date-card .weekday {\n  display: block;\n  text-transform: uppercase;\n  letter-spacing: 0.18em;\n  color: var(--gray-600);\n}\n.date-card .day {\n  display: block;\n  font-weight: 700;\n  font-size: 1.05rem;\n}\n\n.date-card.selected {"
if needle not in text:
    raise SystemExit('needle not found')
text = text.replace(needle, insert, 1)
path.write_text(text, encoding='utf-8')
