/**
 * @file This file is designed to initialize the view and
 */
const HEIGHT = 400;
const WIDTH = 600;
const MARGIN = {
  top: 100,
  right: 100,
  bottom: 100,
  left: 100
};
const DURATION = 500;

/**
 * Data Map
 */
function get(stepId) {
  return data[stepId]
}

function groupBarData(step) {
  const table = get(step)
  const groups = d3.group(table, d => d.Bin);

  return {
    table,
    groups
  }
}

function generateCategoryKey() {

}

/**
 * Data Helpers
 */

/**
 * @returns {{ data: Array<{ bin: string, count: number }>, count: number }}
 */
function mapSimpleData(groups) {
  let output = [];
  let maxCount = -1;
  for (const key of groups.keys()) {
    if (groups.get(key).length > maxCount) maxCount = groups.get(key).length;

    output.push({
      bin: key,
      count: groups.get(key).length
    });
  }

  return {
    data: output,
    maxCount: Math.round(maxCount / 10) * 10
  };
}

/**
 * Syntax helpers
 */
function formatRange(range) {
  return range.slice(1, -1).replace(', ', ' to ');
}

/**
 * Node getters
 */
function getSvg() {
  if (d3.select('#main').select('svg').nodes().length) {
    return d3.select('#main').select('svg');
  }

  return d3.select("#main")
    .append("svg")
    .attr("id", "viewport")
    .attr("height", HEIGHT)
    .attr("width", WIDTH)
    .attr("viewBox", [0, 0, WIDTH, HEIGHT]);
}

function getXAxis() {
  if (getSvg().select('#x-axis').nodes().length) {
    return getSvg().select('#x-axis');
  }

  return getSvg().append("g")
    .attr('id', 'x-axis');
}

function getYAxis() {
  if (getSvg().select('#y-axis').nodes().length) {
    return getSvg().select('#y-axis');
  }

  return getSvg().append("g")
    .attr('id', 'y-axis');
}

/**
 * Render
 * -------------------
 */

/**
 *
 */
function renderYAxis(y, label) {
  getYAxis()
    .attr("transform", `translate(100, 0)`)
    .transition()
    .delay(DURATION)
    .call(d3.axisLeft(y))

  return {
    y
  }
}

function renderXAxis(x, label) {
  getXAxis()
    .attr("transform", `translate(0, ${HEIGHT - 100})`)
    .transition()
    .delay(DURATION)
    .call(d3.axisBottom(x).tickFormat(formatRange))//.tickSizeOuter(0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  return {
    x
  }
}

/**
 * Follows the old pattern
 */
function renderBarPlots(data, x, y) {
  let bars = getSvg()
    .selectAll(".bar")
    .data(data, d => d.bin)
    .join(
      enter => enter.append('rect')
        .attr("class", "bar")
        .attr('x', d => x(d.bin))
        .attr('width', x.bandwidth())
        // TODO transition this to use margin?
        .attr('y', d => HEIGHT - 100)
        .attr('height', _ => 0)
        // TODO move these to styles?
        .attr("fill", "#4A90E2")
        .attr("stroke", "#357ABD")
        .attr("stroke-width", 1)
        // animate the new elements added
        .transition()
          .duration(DURATION)
          .ease(d3.easeExpIn)
          .attr("y", function (d) { return y(d.count); })
          // TODO transition this to use margin?
          .attr("height", function (d) { return HEIGHT - 100 - y(d.count); })
          .delay(function (d, i) { return (i * 50) }
      ),
      update => update.transition()
        .duration(DURATION)
        .ease(d3.easeExpIn)
        .attr("y", function (d) { return y(d.count); })
        // TODO transition this to use margin?
        .attr("height", function (d) { return HEIGHT - 100 - y(d.count); })
        .delay(function (d, i) { return (i * 50) }),
      exit => exit.transition()
        .duration(DURATION)
        .ease(d3.easeCircleOut)
        .attr("height", 0)
        .attr("y", HEIGHT - 100)
        .remove()
    );

  return {
    bars,
    x,
    y
  }
}

function renderComplexBarPlot(data, x, y, mode) {

}

/**
 * Rendering code references:
 * https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
 *
 * Data from -3500BCE to 1800CE
 */
function renderStep1() {
  // Table data, but we will map to a simpler data structure for the bar plot
  const { groups } = groupBarData(0)
  const { data, maxCount } = mapSimpleData(groups);

  // scales
  const x = d3.scaleBand().domain(groups.keys()).range([100, WIDTH - 100])
  const y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - 100, 100])

  // trigger renders
  renderXAxis(x);
  renderYAxis(y);
  return renderBarPlots(data, x, y);
}

/**
* Data from -3500BCE to 2000CE
 */
function renderStep2() {
  // Table data, but we will map to a simpler data structure for the bar plot
  const { groups } = groupBarData(1)
  const { data, maxCount } = mapSimpleData(groups);

  // scales
  const x = d3.scaleBand().domain(groups.keys()).range([100, WIDTH - 100])
  const y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - 100, 100])

  // trigger renders
  renderXAxis(x);
  renderYAxis(y);
  return renderBarPlots(data, x, y);
}

/**
 * Data from -3500BCE to 2021CE
 */
function renderMainBarplot() {
  // Table data, but we will map to a simpler data structure for the bar plot
  const table = get(2);
  // const groups = d3.group(table, d => d["Year Published"]);

  // Use year range to create bins
  const yearRange = d3.extent(table, d => Number(d["Year Published"]))
  const customYearBins = d3.bins().value(mainBarPlotBinningCallback)(table);

  // scales
  // const x = d3.scaleBand().domain(groups.keys()).range([100, WIDTH - 100])
  const y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - 100, 100])

  // TODO add control of stack to enable more kinds of column searches
  let subgroups = data.columns[0]; //TODO find index of
  const stackedData = d3.stack().keys(subgroups)(data)

  // trigger renders
  renderXAxis(x);
  renderYAxis(y);
  return renderComplexBarPlot(stackedData, x, y);
}

function mainBarPlotBinningCallback(datum) {
  const year = Number(datum['YearPublished']);

  if (year < 1970) {
    return "[-3500, 1970)"
  }

  // by 10 years
  // 1980
  // 1990

  // by 5 years
  // 1995
  // 2000
  // 2005
  // 2010
  // 2015

  // by year
  // 2016
  // 2017
  // 2018
  // 2019
  // 2020

  return `${year}`;


}

/**
 * TODO:
 */
function renderTreeMapExplorer() {

}

/**
 * Controls
 * -------------------
 */
let page = 0;

function navigateBackward() {
  if (page === 0) return;

  page--;
  navigateRender();
}

function navigateForward() {
  if (page === data.length) return;

  page++;
  navigateRender();
}

function navigateRender() {
  if (page === 0) {
    return renderStep1()
  }
  if (page == 1) {
    return renderStep2()
  }
  if (page == 2) {
    return renderMainBarplot()
  }
  if (page == 3) {
    return renderTreeMapExplorer()
  }
}

function reset() {
  page = 0;
  return renderStep1();
}

/**
 * Life Cycle
 * -------------------
 */
/**
 * @function init
 * @description
 */
/**
 * Main
 */
async function startScripts() {
  await initData();
  getSvg();

  // Initialize the code to work off of the first step
  renderStep1();
}

startScripts();
