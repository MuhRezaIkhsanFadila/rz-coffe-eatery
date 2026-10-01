export function formatRupiah(value) {
  return 'Rp' + Number(value).toLocaleString('id-ID')
}
