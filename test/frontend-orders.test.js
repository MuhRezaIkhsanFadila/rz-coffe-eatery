import { describe, it, expect } from 'vitest'
import {
  statusLabel,
  flowIndex,
  canCancel,
  isPaidStatus,
  isFinalStatus,
  ORDER_FLOW,
} from '../src/lib/orders.js'

describe('src/lib/orders — label & pelacakan', () => {
  it('memberi label manusiawi untuk setiap status', () => {
    expect(statusLabel('pending')).toBe('Menunggu Bayar')
    expect(statusLabel('processing')).toBe('Diproses')
    expect(statusLabel('ready')).toBe('Siap Diambil')
    expect(statusLabel('completed')).toBe('Selesai')
  })

  it('urutan langkah pelacakan sesuai siklus pesanan', () => {
    expect(ORDER_FLOW.map((s) => s.key)).toEqual([
      'pending',
      'paid',
      'processing',
      'ready',
      'completed',
    ])
    expect(flowIndex('processing')).toBe(2)
    expect(flowIndex('cancelled')).toBe(-1)
  })

  it('pembeli hanya bisa membatalkan sebelum diproses', () => {
    expect(canCancel('pending')).toBe(true)
    expect(canCancel('paid')).toBe(true)
    expect(canCancel('processing')).toBe(false)
    expect(canCancel('completed')).toBe(false)
  })

  it('membedakan status lunas dan status akhir', () => {
    expect(isPaidStatus('ready')).toBe(true)
    expect(isPaidStatus('expired')).toBe(false)
    expect(isFinalStatus('completed')).toBe(true)
    expect(isFinalStatus('paid')).toBe(false)
  })
})
