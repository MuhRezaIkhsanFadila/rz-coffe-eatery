// Generator QRIS (EMVCo) untuk DEMO pembayaran.
// Menghasilkan string EMV yang terstruktur + CRC16 valid.
// Catatan: ini merchant demo, bukan QRIS terdaftar — tidak bisa dibayar sungguhan.

function tlv(id, value) {
  const v = String(value)
  return id + String(v.length).padStart(2, '0') + v
}

function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function makeRef() {
  // Stempel waktu saja tidak cukup: dua pesanan pada milidetik yang sama
  // akan berbagi nomor referensi. Tambahkan 4 karakter acak.
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0')
  return 'RZ' + stamp + rand
}

function buildQris(amount, ref) {
  const merchantAccount =
    tlv('00', 'ID.CO.QRIS.WWW') +
    tlv('01', '9360000000000000000') +
    tlv('02', 'ID1234567890')

  const additional = tlv('01', String(ref || makeRef()).slice(0, 25))

  let payload =
    tlv('00', '01') + // Payload format indicator
    tlv('01', '12') + // Point of initiation: 12 = dynamic
    tlv('26', merchantAccount) +
    tlv('52', '5812') + // MCC: eating places
    tlv('53', '360') + // Currency: IDR
    tlv('54', String(Math.max(0, Math.round(amount)))) +
    tlv('58', 'ID') +
    tlv('59', 'RZ COFFE & EATERY'.slice(0, 25)) +
    tlv('60', 'JAKARTA') +
    tlv('62', additional)

  payload += '6304'
  return payload + crc16(payload)
}

module.exports = { buildQris, makeRef, crc16, tlv }
