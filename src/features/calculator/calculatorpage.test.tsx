import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import CalculatorPage from './CalculatorPage'

afterEach(() => {
  cleanup()
})

async function pressKeys(...keys: string[]) {
  const user = userEvent.setup()

  render(<CalculatorPage />)

  for (const key of keys) {
    await user.click(
      screen.getByRole('button', { name: key }),
    )
  }
}

function expectDisplay(value: string) {
  expect(
    screen.getByText(value, { selector: 'output' }),
  ).toBeInTheDocument()
}

describe('Calculator functionality', () => {
  it('adds two numbers', async () => {
    await pressKeys('2', '+', '3', '=')
    expectDisplay('5')
  })

  it('subtracts two numbers', async () => {
    await pressKeys('9', '−', '4', '=')
    expectDisplay('5')
  })

  it('multiplies two numbers', async () => {
    await pressKeys('6', '×', '7', '=')
    expectDisplay('42')
  })

  it('divides two numbers', async () => {
    await pressKeys('8', '÷', '2', '=')
    expectDisplay('4')
  })

  it('handles decimal calculations', async () => {
    await pressKeys('1', '.', '5', '+', '2', '.', '5', '=')
    expectDisplay('4')
  })

  it('prevents duplicate decimal points', async () => {
    await pressKeys('1', '.', '5', '.', '2')
    expectDisplay('1.52')
  })

  it('converts a number to a percentage', async () => {
    await pressKeys('5', '0', '%')
    expectDisplay('0.5')
  })

  it('toggles a number between positive and negative', async () => {
    await pressKeys('5', '±')
    expectDisplay('-5')
  })

  it('clears the calculator', async () => {
    await pressKeys('8', '+', '2', 'AC')
    expectDisplay('0')
  })

  it('handles division by zero', async () => {
    await pressKeys('8', '÷', '0', '=')

    expectDisplay('0')
    expect(screen.getByText('Cannot divide by zero.')).toBeInTheDocument()
  })

  it('starts a new number after calculating a result', async () => {
    await pressKeys('2', '+', '3', '=', '7')
    expectDisplay('7')
  })
})
