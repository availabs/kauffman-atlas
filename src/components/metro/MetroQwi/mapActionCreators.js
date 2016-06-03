import _ from 'lodash'

import * as actions from '../../../redux/modules/metroQwiData/actions'

export default _.pickBy(actions, _.isFunction)
