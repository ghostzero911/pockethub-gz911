
import { useState } from 'react'

type Operator = '+' | '−' | '×' | '÷'

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [startNewNumber, setStartNewNumber] = useState(false)
  const [error, setError] = useState('')

  function enterDigit(digit: string) {
    setError('')
    setDisplay((current) => {
      if (startNewNumber || current === '0') {
        setStartNewNumber(false)
        return digit
      }
      if (current.replace('-', '').replace('.', '').length >= 12) {
        return current
      }
      return current + digit
    })
  }

  function enterDecimal() {
    setError('')
    if (startNewNumber) {
      setDisplay('0.')
      setStartNewNumber(false)
      return
    }
    setDisplay((current) => current.includes('.') ? current : `${current}.`)
  }

  function chooseOperator(nextOperator: Operator) {
    setError('')
    const value = Number(display)

    if (storedValue !== null && operator && !startNewNumber) {
      const result = calculate(storedValue, value, operator)
      if (result === null) {
        reset()
        setError('Cannot divide by zero.')
        return
      }
      setDisplay(formatResult(result))
      setStoredValue(result)
    } else {
      setStoredValue(value)
    }

    setOperator(nextOperator)
    setStartNewNumber(true)
  }

  function calculate(a: number, b: number, op: Operator): number | null {
    if (op === '+') return a + b
    if (op === '−') return a - b
    if (op === '×') return a * b
    if (op === '÷') return b === 0 ? null : a / b
    return null
  }

  function formatResult(value: number) {
    if (!Number.isFinite(value)) return 'Error'
    return String(Number(value.toPrecision(10)))
  }

  function equals() {
    if (storedValue === null || !operator) return

    const result = calculate(storedValue, Number(display), operator)
    if (result === null) {
      setDisplay('0')
      setError('Cannot divide by zero.')
    } else {
      setDisplay(formatResult(result))
      setError('')
    }

    setStoredValue(null)
    setOperator(null)
    setStartNewNumber(true)
  }

  function reset() {
    setDisplay('0')
    setStoredValue(null)
    setOperator(null)
    setStartNewNumber(false)
    setError('')
  }

  function toggleSign() {
    if (display !== '0') {
      setDisplay((current) => current.startsWith('-') ? current.slice(1) : `-${current}`)
    }
  }

  function percentage() {
    setDisplay(formatResult(Number(display) / 100))
    setStartNewNumber(true)
    setError('')
  }

  const keys: { label: string; action: () => void; kind?: string }[] = [
    { label: 'AC', action: reset, kind: 'utility' },
    { label: '±', action: toggleSign, kind: 'utility' },
    { label: '%', action: percentage, kind: 'utility' },
    { label: '÷', action: () => chooseOperator('÷'), kind: 'operator' },
    { label: '7', action: () => enterDigit('7') },
    { label: '8', action: () => enterDigit('8') },
    { label: '9', action: () => enterDigit('9') },
    { label: '×', action: () => chooseOperator('×'), kind: 'operator' },
    { label: '4', action: () => enterDigit('4') },
    { label: '5', action: () => enterDigit('5') },
    { label: '6', action: () => enterDigit('6') },
    { label: '−', action: () => chooseOperator('−'), kind: 'operator' },
    { label: '1', action: () => enterDigit('1') },
    { label: '2', action: () => enterDigit('2') },
    { label: '3', action: () => enterDigit('3') },
    { label: '+', action: () => chooseOperator('+'), kind: 'operator' },
    { label: '0', action: () => enterDigit('0'), kind: 'zero' },
    { label: '.', action: enterDecimal },
    { label: '=', action: equals, kind: 'equals' },
  ]

  return (
    <section className="page-content">
      <div className="page-intro">
        <span className="eyebrow">QUICK CALCULATIONS</span>
        <h1>Calculator</h1>
        <p>Simple maths, without the clutter.</p>
      </div>

      <div className="panel-card calculator-card">
        <div className="calculator-display">
          <span>{operator && storedValue !== null ? `${formatResult(storedValue)} ${operator}` : 'PocketHub calculator'}</span>
          <output aria-live="polite">{display}</output>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="calculator-keys">
          {keys.map((key) => (
            <button
              key={key.label}
              className={`calculator-key ${key.kind ?? ''} ${operator === key.label ? 'selected' : ''}`}
              onClick={key.action}
            >
              {key.label}
            </button>
          ))}
        </div>

        <p className="calculator-footnote">Results are calculated locally on your device.</p>
      </div>
    </section>
  )
}
