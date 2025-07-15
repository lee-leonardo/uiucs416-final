/**
 * @file This file is designed to initialize the view and
 */
const HEIGHT = 400;
const WIDTH = 400;
const MARGIN = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

/**
 * Data Map
 */
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
 * Render
 * -------------------
 */

let xAxis, yAxis;

/**
 * Data from -3500BCE to 1800CE
 */
function renderStep1() {
  const { groups } = groupBarData(0)
  const labels = [];

  for (const key of groups.keys()) {
    const range = [];
    for (const val of key.matchAll(/(?<=[\[\(])-?\d+|(?<=,)-?\d+(?=[\]\)])/g)) {
      range.push(val)
    }
    labels.push(range.join(" - "))

    // groups.get(key).length // group size

    // TODO: find max
    // TODO find a good scaling value for Y


    let x = d3.scaleBand().domain(labels).range([0,100])
    console.log(x)
    // xAxis =

    // let y = d3.
    // yAxis =
  }


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
function init() {
  return d3.select("#main")
    .append("svg")
    .attr("id", "viewport")
    .attr("height", HEIGHT)
    .attr("width", WIDTH)
    .attr("viewBox", "0 0 300 100")
    ;
}

/**
 * Main
 */
async function startScripts() {
  console.log('init');
  await initData();
  const svg = init();

  // TODO:
}

startScripts();
