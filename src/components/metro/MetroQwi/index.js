import { connect } from 'react-redux'

import MetroQwi from './MetroQwi'

import mapStateToProps from './mapStateToProps'
import mapActionCreators from './mapActionCreators'


export default connect(mapStateToProps, mapActionCreators)(MetroQwi)
