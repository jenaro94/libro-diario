export const parseYYYYMMDD = (date) => {
  return date.split('/').map(p => p.length < 2 ? `0${p}` : p).reverse().join('-')
}
