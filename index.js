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
const COLOR_PALETTE = d3.schemeSpectral[11]; // https://observablehq.com/@d3/working-with-color
const COLOR_SCALE = ['#1E88E5', '#D81B60']; // chosen from https://davidmathlogic.com/colorblind/#%23D81B60-%231E88E5-%23FFC107-%23004D40, two colors with high compat with all kinds of color blindness.

// set to 11 bins to support the coloration
const YEAR_THRESHOLDS = [-3500, 1970, 1990, 1995, 2000, 2005, 2010, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020];

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
function formatExtentToBin(extent) {
  // No Range single item
  if (extent[0] === extent[1]) return `[${extent[0]})`;

  return `[${extent[0]}, ${extent[1]})`;
}

function formatYearRangeToLabel(range) {
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

/**
 *
 */
function renderXAxis(x, label) {
  getXAxis()
    .attr("transform", `translate(0, ${HEIGHT - 100})`)
    .transition()
    .delay(DURATION)
    .call(d3.axisBottom(x).tickFormat(formatYearRangeToLabel))//.tickSizeOuter(0))
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
        // TODO move these to styles? These will not work with stacks?
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

function renderStackedBarPlot(data, x, y, color) {
  let bars = getSvg()
    .selectAll(".bar")
    .data(data, d => d.bin)
    .join(
      enter => enter.append('rect')
        .attr("class", "bar")
        .attr('x', d => x(d.bin))
        .attr('width', x.bandwidth())
        // TODO transition this to use margin?
        .attr('y', _ => HEIGHT - 100)
        .attr('height', _ => 0)
        // TODO move these to styles? These will not work with stacks?
        .attr("fill", d => color(d.key))
        .attr("stroke", "#000035")
        .attr("stroke-width", 1)
        // animate the new elements added
        .transition()
        .duration(DURATION)
        .ease(d3.easeExpIn)
        .attr("y", function (d) { return y(d.count); })
        // TODO transition this to use margin?
        .attr("height", function (d) { return HEIGHT - 100 - y(d.count); })
        .delay(function (d, i) { return (i * 50) }),
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
    y,
    color
  }
}

// TODO render barplot with multi dimensional modifications

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
 * Data from -3500BCE to 2020CE
 */
function renderStep3() {
  // Table data, but we will map to a simpler data structure for the bar plot
  const table = get(2);

  // use thi
  const yearRanges =  [
    ...d3.pairs(YEAR_THRESHOLDS.slice(0, YEAR_THRESHOLDS.indexOf(2025))),
    ...d3.range(2016, 2021).map(el => [el, el])
  ];
  const yearKeys = yearRanges.map(formatExtentToBin);

  const yearBinGroup = d3.group(table, d => {
    const groupId = yearRanges.findIndex(([min, max]) => {
      const year = Number(d['Year Published']);
      return year >= min && (year < max || min == max)
    });
    return yearKeys[groupId];
  })

  // Take the bins here and iterate through each one to generate the stack within them?
  const stackedDataArr = Array.from(yearBinGroup).map(el => {
    const stacked = d3.stack().keys(['Min Age'])(el[1]);
    // Stack internally for each of the bins, this then is porportional to the aggregate by way of the max of all the maxes
    return [el[0], stacked]
  });
  const stackedData = new d3.InternMap(stackedDataArr);

  // Get the max of all the maxes
  const maxCount = d3.max(m.map(el => d3.max(el[1][0], d => d[1])))

  // scales
  let x = d3.scaleBand().domain(yearKeys).range([100, WIDTH - 100])
  let y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - 100, 100])

  let selectedColumn = table.columns.indexOf('Min Players');
  let subgroups = table.columns[selectedColumn];

  // color palette = one color per subgroup
  let color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(COLOR_PALETTE)
    .unknown('#ccc')

  // TODO class this stack data is not working with the logic
  // TODO map to simpler object before doing the below
  let bars;

  // trigger renders
  renderXAxis(x);
  renderYAxis(y);
  ({ bars, x, y, color } = renderStackedBarPlot(stackedData, x, y, color));

  return {
    bars,
    x,
    y,
    color,
  };
}

function renderFinal() {

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
    return renderStep3()
  }
  if (page == 3) {
    return renderFinal()
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
