import requestedRawMeasures from './requestedRawMeasures'

export const requestedRatioMeasures = requestedRawMeasures.map(m => `${m}_ratio`)

export default requestedRatioMeasures

