import React from 'react'
import { Route, IndexRoute } from 'react-router'

// NOTE: here we're making use of the `resolve.root` configuration
// option in webpack, which allows us to specify import paths as if
// they were from the root of the ~/src directory. This makes it
// very easy to navigate to files regardless of how deeply nested
// your current file is.
import CoreLayout from 'layouts/CoreLayout/CoreLayout'
import HomeView from 'views/HomeView/HomeView'
import DensityView from 'views/national/DensityView'
import DiversityView from 'views/national/DiversityView'
import FluidityView from 'views/national/FluidityView'
import CombinedView from 'views/national/CombinedView'
import MetroHome from 'views/metro/MetroHome'

export default (store) => (
  <Route path='/' component={CoreLayout}>
    <IndexRoute component={HomeView} />
    <Route path='/density' component={DensityView} />
    <Route path='/diversity' component={DiversityView} />
    <Route path='/fluidity' component={FluidityView} />
	<Route path='/combined' component={CombinedView} />
	<Route path='/metro/:geoid' component={MetroHome} />
  </Route>
)
