export const kmgtFormatter = (fixedN, y) => {

  fixedN = Number.isFinite(fixedN) ? fixedN : 1
  
  if (y < 1000) {
    return y.toFixed((y % 1) && fixedN).toString()
  } 
  
  if (y < 1000000) {
    return (y/1000).toFixed(fixedN) + 'k'
  } 

  if (y < 1000000000) {
    return (y/1000000).toFixed(fixedN) + 'm   '
  }

  if (y < 1000000000000) {
    return (y/1000000000).toFixed(fixedN) + 'g'
  }
  
  return (y/1000000000000).toFixed(fixedN) + 't'
}


export const kmgtDollarFormatter = (fixedN, y) => `\$${kmgtFormatter(fixedN, y)}`
