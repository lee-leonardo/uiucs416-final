/**
 * @file This file is designed to initialize the view and
 */
const HEIGHT = 400;
const WIDTH = 600;
const MARGIN = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

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
    return getSvg().select('yx-axis');
  }

  return getSvg().append("g")
    .attr('id', 'y-axis');
}

/**
 * Render
 * -------------------
 */
/**
 * Rendering code references:
 * https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
 *
 * Data from -3500BCE to 1800CE
 */
function renderStep1() {
  // Table data, but we will map to a simpler data structure for the bar plot
  const { groups } = groupBarData(0)

  /**
   * @type {Array<{ bin: string, count: number }>}
   */
  const data = [];

  let maxCount = -1;
  for (const key of groups.keys()) {
    if (groups.get(key).length > maxCount) maxCount = groups.get(key).length;

    data.push({
      bin: key,
      count: groups.get(key).length
    });
  }
  maxCount = Math.round(maxCount / 10) * 10

  const x = d3.scaleBand().domain(groups.keys()).range([100, WIDTH-100])
  const y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - 100, 100])

  // x axis
  getXAxis()
    .attr("transform", `translate(0, ${HEIGHT-100})`)
    .call(d3.axisBottom(x).tickFormat(formatRange))//.tickSizeOuter(0))
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  // y axis
  getYAxis()
    .attr("transform", `translate(100, 0)`)
    .call(d3.axisLeft(y))

  // labels


  // create bar plots
  getSvg()
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.bin))
    .attr('width', x.bandwidth())
    .attr('y', d => HEIGHT - 100)
    .attr('height', _ => 0)
    // TODO figure out if I like this
    .attr("fill", "#4A90E2")
    .attr("stroke", "#357ABD")
    .attr("stroke-width", 1)
  // animate bar plots
    .transition()
      .duration(500)
      .ease(d3.easeElastic) // Bouncy easing
      .attr("y", function (d) { return y(d.count); })
      .attr("height", function (d) { return HEIGHT - 100 - y(d.count); })
      .delay(function (d, i) { return (i * 50) })
}

/**
* Data from -3500BCE to 2000CE
 */
function renderStep2() {

}

/**
 * Data from -3500BCE to 2021CE
 */
function renderMainBarplot() {

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

function clearEvents() {

}

function navigateBackward() {
  if (page === 0) return;

  console.log('navigate backwards', page)

  page--;
  navigateRender();
}

function navigateForward() {
  if (page === data.length) return;

  console.log('navigate forwards', page)

  page++;
  navigateRender();
}

function navigateRender() {
  clearEvents();

  if (page === 1) {
    return renderStep1()
  }
  if (page == 2) {
    return renderStep2()
  }
  if (page == 3) {
    return renderMainBarplot()
  }
  if (page == 4) {
    return renderTreeMapExplorer()
  }
}

function reset() {
  clear();
  renderStep1();
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
  console.log('init');
  await initData();
  getSvg();

  // Initialize the code to work off of the first step
  renderStep1();
}

startScripts();
