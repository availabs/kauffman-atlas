"use strict"


export const mapStateToProps = (state) => {

  //console.log(state.metroQwiData)

  return {
    lineGraphRawData                : state.metroQwiData.lineGraphs.rawGraphData,
    lineGraphLQData                 : state.metroQwiData.lineGraphs.lqGraphData,
    tooltipData                     : state.metroQwiData.tooltipTable.data,
    shareByIndustryRadarGraphData   : [state.metroQwiData.selectedFirmageRadarChartData],
    shareOfMetroTotalRadarGraphData : [state.metroQwiData.acrossFirmagesRadarChartData],
    overviewTableData               : state.metroQwiData.overviewTable.data,
    selectedQuarter                 : state.metroQwiData.selectedQuarter,
    measureIsCurrency               : state.metroQwiData.measureIsCurrency,
    focusedLineGraph                : state.metroQwiData.lineGraphs.focused,
    selectedFirmage                 : state.metroQwiData.selectedFirmage,
    tooltipHoveredNaicsLabel        : state.metroQwiData.tooltipTable.hoveredNaicsLabel,
  }
}


export default mapStateToProps
