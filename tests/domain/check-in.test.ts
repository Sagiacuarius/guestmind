import { describe, it, expect } from 'vitest'
import { validateCheckInForm } from '../../src/domain/check-in'

describe('validateCheckInForm', () => {
  it('rechaza formulario vacío', () => {
    const result = validateCheckInForm({})
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBe('required')
    expect(result.errors.email).toBe('required')
  })

  it('rechaza nombre vacío', () => {
    const result = validateCheckInForm({ name: '', email: 'test@test.com', checkInDate: '2026-06-10' })
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBe('required')
  })

  it('rechaza email vacío', () => {
    const result = validateCheckInForm({ name: 'Leo', email: '', checkInDate: '2026-06-10' })
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBe('required')
  })

  it('rechaza email inválido', () => {
    const result = validateCheckInForm({ name: 'Leo', email: 'no-es-email', checkInDate: '2026-06-10' })
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBe('invalid')
  })

  it('rechaza sin fecha de check-in', () => {
    const result = validateCheckInForm({ name: 'Leo', email: 'leo@test.com' })
    expect(result.valid).toBe(false)
    expect(result.errors.checkInDate).toBe('required')
  })

  it('acepta formulario completo', () => {
    const result = validateCheckInForm({
      name: 'María Silva',
      email: 'maria@test.com',
      checkInDate: '2026-06-10',
      language: 'pt',
    })
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('acepta email con subdominio', () => {
    const result = validateCheckInForm({
      name: 'John',
      email: 'john@hotel.guestmind.ai',
      checkInDate: '2026-06-10',
    })
    expect(result.valid).toBe(true)
  })

  it('rechaza email sin dominio', () => {
    const result = validateCheckInForm({
      name: 'John',
      email: 'john@',
      checkInDate: '2026-06-10',
    })
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBe('invalid')
  })

  it('rechaza email sin arroba', () => {
    const result = validateCheckInForm({
      name: 'John',
      email: 'johngmail.com',
      checkInDate: '2026-06-10',
    })
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBe('invalid')
  })
})
