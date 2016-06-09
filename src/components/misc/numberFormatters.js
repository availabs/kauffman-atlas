export const kmgtFormatter = (fixedN, n) => {

  if (!Number.isFinite(n)) { return n }

  fixedN = Number.isFinite(fixedN) ? fixedN : 1
  
  if (n < 1000) {
    return n.toFixed((n % 1) && fixedN).toString()
  } 
  
  if (n < 1000000) {
    return (n/1000).toFixed(fixedN) + 'k'
  } 

  if (n < 1000000000) {
    return (n/1000000).toFixed(fixedN) + 'm   '
  }

  if (n < 1000000000000) {
    return (n/1000000000).toFixed(fixedN) + 'g'
  }
  
  return (n/1000000000000).toFixed(fixedN) + 't'
}


export const kmgtDollarFormatter = (fixedN, n) => ((Number.isFinite(n)) ? `\$${kmgtFormatter(fixedN, n)}` : n)
