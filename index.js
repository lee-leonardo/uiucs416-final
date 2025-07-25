/**
 * @file This file is designed to initialize the view and
 */
const HEIGHT = 600;
const WIDTH = 800;
const DEFAULT_MARGIN = 80;
const MARGIN = {
  top: DEFAULT_MARGIN,
  right: DEFAULT_MARGIN,
  bottom: DEFAULT_MARGIN,
  left: DEFAULT_MARGIN
};
const CIRCLE_SIZE = [3, 15];
const DURATION = 500;
const COLOR_PALETTE = d3.schemeSpectral[11]; // https://observablehq.com/@d3/working-with-color
const COLOR_SCALE = ['#1E88E5', '#D81B60']; // chosen from https://davidmathlogic.com/colorblind/#%23D81B60-%231E88E5-%23FFC107-%23004D40, two colors with high compat with all kinds of color blindness.
const DATA_TYPES = {
  /** @desc ordered, discrete - sizes */
  ORD: 'ordinal',
  /** @desc ordered, discrete - counts */
  QUANT: 'quantitative',
  /** @desc  unordered, discrete - shapes */
  NOM: 'nominal',
  /** @desc unordered, discrete - nationality */
  CAT: 'categorical',
  /** @desc ordered, continuous - temp, average */
  FIELD: 'field',
  /** @desc unordered, continous - directions, hues */
  CYC: 'cyclic'
}

// set to 11 bins to support the coloration
const YEAR_THRESHOLDS = [-3500, 1970, 1990, 1995, 2000, 2005, 2010, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020];


// ID, Name, Year Published, Min Players, Max Players, Play Time, Min Age, Users Rated, Rating Average, BGG Rank, Complexity Average, Owned Users, Mechanics, Domains

/**
 * @typedef {{ ID: string, Name: string; "Year Published": string, "Min Players": string, "Max Players": string, "Play Time": string, "Min Age": string, "Users Rated": string, "Rating Average": string, "BGG Rank": string, "Complexity Average": string, "Owned Users": string, "Mechanics": string, "Domains": string }} RawDataRow
 */
/**
 * @typedef {RawDataRow & { yearPublished: number, minPlayers: number, maxPlayers: number, playTime: number, minAge: number, usersRated: number, ratingAverage: number, bggRank: number, complexityAverage: number, ownedUsers: number }} CsvDataRow
 */
/**
 * @typedef {CsvDataRow & { '' : number }} DateRangeStatistics
 */

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
 * CSV assumes strings, converts all the numerical data to numbers for usage.
 * @param {RawDataRow} rawData
 * @param {number} index
 * @returns {CsvDataRow} the mapped object from the data provided
 */
function mapRawData(row, i) {
  return {
    ...row,
    id: Number(row['ID']),
    yearPublished: Number(row['Year Published']),
    minPlayers: Number(row['Min Players']),
    maxPlayers: Number(row['Max Players']),
    playTime: Number(row['Play Time']),
    minAge: Number(row['Min Age']),
    usersRated: Number(row['Rating Average']),
    bggRank: Number(row['BGG Rank']),
    complexityAverage: Number(row['Complexity Average']),
    ownedUsers: Number(row['Owned Users'])
  }
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
function renderYAxisBarplot(y, label) {
  getYAxis()
    .attr("transform", `translate(${DEFAULT_MARGIN}, 0)`)
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
function renderXAxisBarplot(x, label) {
  getXAxis()
    .attr("transform", `translate(0, ${HEIGHT - DEFAULT_MARGIN})`)
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
 * @param {object} x
 * @param {object} y
 * @param {{ xLabel: string, yLabel:string, xType: string, yType: string }} options - values to pass to customize behavior
 */
function renderScatterplotAxis(x, y, options) {
  let xAxis = getXAxis()
    .attr("transform", `translate(0, ${HEIGHT - DEFAULT_MARGIN})`)
    .transition()
    .delay(DURATION)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");


  let yAxis = getYAxis()
    .attr("transform", `translate(${DEFAULT_MARGIN}, 0)`)
    .transition()
    .delay(DURATION)
    .call(d3.axisLeft(y))

  return {
    x,
    y,
    options
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
        .attr('y', d => HEIGHT - MARGIN.top)
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
        .attr("height", function (d) { return HEIGHT - MARGIN.bottom - y(d.count); })
        .delay(function (d, i) { return (i * 50) }
        ),
      update => update.transition()
        .duration(DURATION)
        .ease(d3.easeExpIn)
        .attr("y", function (d) { return y(d.count); })
        // TODO transition this to use margin?
        .attr("height", function (d) { return HEIGHT - MARGIN.bottom - y(d.count); })
        .delay(function (d, i) { return (i * 50) }),
      exit => exit.transition()
        .duration(DURATION)
        .ease(d3.easeCircleOut)
        .attr("height", 0)
        .attr("y", HEIGHT - MARGIN.bottom)
        .remove()
    );

  return {
    bars,
    x,
    y
  }
}

/**
 * @param {string} key
 * @return {{ key: string, type: string }} value
 */
function valuesFromDropdown(key) {
  // select type

  let type;
  switch (key) {
    case 'BGG Rank':
    case 'bggRank':
    case 'Min Players':
    case 'minPlayers':
    case 'Max Players':
    case 'maxPlayers':
      type = DATA_TYPES.ORD
      break;
    case 'Name':
      type = DATA_TYPES.CYC
      break;
    case 'Year Published':
    case 'yearPublished':
    case 'Mechanics':
    case 'Domains':
      type = DATA_TYPES.CAT
      break;
    case 'ID':
    case 'Min Age':
    case 'minAge':
      type = DATA_TYPES.NOM
      break;
    case 'Rating Average':
    case 'ratingAverage':
    case 'Complexity Average':
    case 'complexityAverage':
      type = DATA_TYPES.FIELD
      break;
    case 'Play Time':
    case 'playTime':
    case 'Owned Users':
    case 'ownedUsers':
    case 'Users Rated':
    case 'usersRated':
    default:
      type = DATA_TYPES.QUANT
  }

  return {
    key,
    type,
  }
}


/**
 * Scale from key type
 * @param {string} key
 * @param {string} type
 */
function getScaleFromKeyAndType(table, key, type) {
  let scale;
  let domain;
  let skew; // number
  let hasZero;

  switch (type) {
    case DATA_TYPES.NOM:
    case DATA_TYPES.CYC:
      break;
    case DATA_TYPES.QUANT:
    case DATA_TYPES.FIELD:
      // -0.5 < skew && skew < 0.5 no transform
      scale = d3.scaleLinear()
      domain = d3.extent(table, d => d[key])
      skew = measureSkew(table, key)
      hasZero = table.reduce((acc, d) => acc || d[key], false)

      // TODO domain mods

      if ((domain[0] < 0 || hasZero) && Math.abs(skew) > 0.5) {
        // avoid log and square root scales with negative and zero values
        scale = d3.scaleSymlog()
      } if (-1 < skew && skew < -0.5) {
        // mild left skew
        scale = d3.scalePow();
      } else if (0.5 < skew && skew < 1) {
        // mild right skew
        scale = d3.scaleSqrt();
      } else if (skew <= -1) {
        // large left skew
        scale = d3.scalePow();
      } else if (1 <= skew) {
        // large right skew
        scale = d3.scaleLog()
      } else {
        // TODO add domain padding for linear, what would be a good value?
      }

      break;
    case DATA_TYPES.CAT:
    case DATA_TYPES.ORD:
    default:
      scale = d3.scalePoint();
      // TODO make sure this is right
      domain = d3.union(table, d => d[key]);
      break;
  }

  // let x = d3.scaleLinear().domain(xDomain).range([MARGIN.left, WIDTH - MARGIN.right]);
  // let y = d3.scaleLog().domain(d3.extent(table, d => d.count)).range([HEIGHT - MARGIN.bottom, MARGIN.top]);
  // let size = d3.scaleLinear().domain(d3.extent(table, d => d.minPlayers)).range(CIRCLE_SIZE);

  // let p = d3.scalePoint()
  // // d3.scaleOrdinal()

  return scale.domain(domain);
}

/**
 * Measure skew
 */
function measureSkew(data, key) {
  const count = data.length;
  const mean = d3.mean(values, d=>d[key])
  const dev = d3.deviation(values, d=>d[key])

  const skew = data.reduce((sum, val) => (
    sum + Math.pow((val - mean) / dev, 3)
  ), 0);

  return skew / count;
}

/**
 * @param {object} data
 * @param {}
 */
function renderScatterplot(data, x, y, size, color, keys) {
  let plots = getSvg()
    .selectAll('.scatter')
    .data(data, d => d[keys.id])
    .join(
      enter => enter.append('circle')
        .attr('id', d => d.key)
        .attr('class', 'scatter')
        .attr('cx', d => x(d[keys.x]))
        .attr('cy', d => y(d[keys.y]))
        .attr('r', 0)
        .attr('fill', d => color(d[keys.color]))
        .transition()
        .duration(DURATION)
        .ease(d3.easeBounce)
        .attr('r', d => size(d[keys.size]))
        .delay((d, i) => i * 10),
      update => update.transition()
        .duration(DURATION)
        .ease(d3.easeCircle)
        .attr('id', d => d.key)
        .attr('cx', d => x(d[keys.x]))
        .attr('cy', d => y(d[keys.y]))
        .attr('r', d => size(d[keys.size]))
        .attr('fill', d => color(d[keys.color]))
        .delay((d,i) => i * 10),
      exit => exit.transition()
        .duration(DURATION)
        .ease(d3.easeElasticOut)
        .attr('r', 0)
        .remove()
    );

    return {
      plots,
      x,
      y,
      size,
      color,
      keys
    }
}

/**
 * Rendering code references:
 * https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
 *
 * Data from -3500BCE to 1800CE
 */
function renderStep1() {
  page = 0;
  updateStateFromPage();

  // Table data, but we will map to a simpler data structure for the bar plot
  const { groups } = groupBarData(0)
  const { data, maxCount } = mapSimpleData(groups);

  // scales
  const x = d3.scaleBand().domain(groups.keys()).range([MARGIN.left, WIDTH - MARGIN.right])
  const y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - MARGIN.bottom, MARGIN.top])

  // trigger renders
  renderXAxisBarplot(x);
  renderYAxisBarplot(y);
  return renderBarPlots(data, x, y);
}

/**
* Data from -3500BCE to 2000CE
 */
function renderStep2() {
  if (page >= 2) {
    getSvg()
      .selectAll(".scatter")
      .transition()
      .remove();
  }
  page = 1;
  updateStateFromPage();

  // Table data, but we will map to a simpler data structure for the bar plot
  const { groups } = groupBarData(1)
  const { data, maxCount } = mapSimpleData(groups);

  // scales
  const x = d3.scaleBand().domain(groups.keys()).range([MARGIN.left, WIDTH - MARGIN.right])
  const y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - MARGIN.bottom, MARGIN.top])

  // trigger renders
  renderXAxisBarplot(x);
  renderYAxisBarplot(y);
  return renderBarPlots(data, x, y);
}

/**
 * Data from 2000 to 2020
 */
function renderStep3() {
  page = 2;
  updateStateFromPage();

  let table = get(2)
    .filter(el => Number(el['Year Published']) > 1999 && Number(el['Year Published']) < 2021 && Number(el['Year Published']) !== 0)
    .map(mapRawData);

  // Create groupings by year published and the minimum players
  table = Object.values(table.reduce((acc, el) => {
    const key = `${el.yearPublished}_${el.minPlayers}`;

    if (!acc[key]) {
      acc[key] = {
        yearPublished: el.yearPublished,
        minPlayers: el.minPlayers,
        maxPlayers: el.maxPlayers,
        key,
        data: []
      }
    }

    acc[key].data.push(el);

    return acc;
  }, {})).map(el => {
    el.count = el.data.length;

    // select the most popular game of the group to annotate with
    // use bggRank to determine most popular game
    let popularIndex = 0;
    el.data.forEach((game, i) => {
      if (game.bggRank > el.data[popularIndex].bggRank) {
        popularIndex = i;
      }
    });
    el.popular = el.data[popularIndex];

    return el;
  })

  const xDomain = d3.extent(table, d => d.yearPublished)
  xDomain[0] -= 1;
  let x = d3.scaleLinear().domain(xDomain).range([MARGIN.left, WIDTH - MARGIN.right]);
  let y = d3.scaleLog().domain(d3.extent(table, d => d.count)).range([HEIGHT - MARGIN.bottom, MARGIN.top]);
  let size = d3.scaleLinear().domain(d3.extent(table, d => d.minPlayers)).range(CIRCLE_SIZE);
  let color = d3.scaleOrdinal(COLOR_PALETTE);

  // trigger renders
  renderScatterplotAxis(x, y, {});
  return renderScatterplot(table, x, y, size, color, {
    id: 'key',
    x: 'yearPublished',
    y: 'count',
    size: 'minPlayers',
    color: 'minPlayers',
  });
}

/**
 * Scatterplot to display data in a way with more pivotable characteristics.
 */
function renderFinalScatterplot() {
  page = 3;
  updateStateFromPage();

  const table = get(2).filter(el => (el['Year Published']) < 2021).map(mapRawData)

  const { key: xKey, type: xType } = valuesFromDropdown(document.getElementById('x-options').value);
  const { key: yKey, type: yType } = valuesFromDropdown(document.getElementById('y-options').value);
  const { key: sKey, type: sType } = valuesFromDropdown(document.getElementById('size-options').value);
  const cKey = document.getElementById('color-options').value;

  let id = 'ID';
  // Determine id via values from the above.
  let x = getScaleFromKeyAndType(table, xKey, xType).range([MARGIN.left, WIDTH - MARGIN.right]);
  let y = getScaleFromKeyAndType(table, yKey, yType).range([HEIGHT - MARGIN.bottom, MARGIN.top])
  let size = getScaleFromKeyAndType(table, sKey, sType).range(CIRCLE_SIZE)
  let color = d3.scaleOrdinal(COLOR_PALETTE);

  renderScatterplotAxis(x, y, {});
  return renderScatterplot(table, x, y, size, color, {
    id,
    x: xKey,
    y: yKey,
    size: sKey,
    color: cKey
  }) // move to plot, x, y ?
}

/**
 * Controls
 * -------------------
 */
let page = 0;
let freeNav = false;

function navigateBackward() {
  if (page === 0) return;

  page--;
  navigateRender();
}

function navigateForward() {
  if (page === 3) return;

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
    return renderFinalScatterplot()
  }
}

function reset() {
  page = 0;
  freeNav = false;

  return renderStep1();
}

function updateStateFromPage() {
  if (page <= 1) {
    getSvg()
      .selectAll(".scatter")
      .transition()
      .delay(DURATION)
      .ease(d3.easeBounceOut)
      .attr('r', 0)
      .transition()
      .remove()
  }

  if (page >= 2) {
    getSvg()
      .selectAll(".bar")
      .transition()
      .delay(DURATION)
      .ease(d3.easeCircleOut)
      .attr('height', 0)
      .attr('y', HEIGHT - MARGIN.bottom)
      .transition()
      .remove()
  }


  // TODO page == 2 disable for controsl
  if (page == 3) {
    document.getElementById('controls').classList.remove('hidden')
    freeNav = true;
  } else {
    document.getElementById('controls').classList.add('hidden')
  }

  document.getElementById('last').disabled = !freeNav || page === 0;
  document.getElementById('next').disabled = page > 2;

  // force users to go forward on the path until completion.
  // Disable the steps when they are less than the
  for (let i = 0; i < 4; i++) {
    document.getElementById(`step${i + 1}`).disabled = !freeNav && i < page;

    if (i < page || i > page) {
      document.getElementById(`desc${i + 1}`).classList.add('hidden');
    } else {
      document.getElementById(`desc${i + 1}`).classList.remove('hidden');
    }
  }
}

function flipAxes() {
  const xOptions = document.getElementById('x-options');
  const yOptions = document.getElementById('y-options');

  // swap
  const temp = xOptions.value;
  xOptions.value = document.getElementById('y-options').value;
  yOptions.value = temp;

  // TODO trigger
}

function setupEvents() {
  document.getElementById('x-options').addEventListener('change', selectChange);
  document.getElementById('y-options').addEventListener('change', selectChange);
  document.getElementById('size-options').addEventListener('change', selectChange);
  document.getElementById('color-options').addEventListener('change', selectChange);
}

function selectChange(event) {
  console.log(event, event.target.id, event.target.value);

  // TODO trigger
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
  setupEvents();

  // Initialize the code to work off of the first step
  updateStateFromPage();
  renderStep1();
}

startScripts();
