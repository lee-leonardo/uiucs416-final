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


// ID, Name, Year Published, Min Players, Max Players, Play Time, Min Age, Users Rated, Rating Average, BGG Rank, Complexity Average, Owned Users, Mechanics, Domains

/**
 * @typedef {{ ID: string, Name: string; "Year Published": string, "Min Players": string, "Max Players": string, "Play Time": string, "Min Age": string, "Users Rated": string, "Rating Average": string, "BGG Rank": string, "Complexity Average": string, "Owned Users": string, "Mechanics": string, "Domains": string }} RawDataRow
 */
/**
 * @typedef {RawDataRow & { yearPublished: number, minPlayers: number, maxPlayers: number, playTime: number, minAge: number, usersRated: number, ratingAverage: number, bggRank: number, complexityAverage: number }} CsvDataRow
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
 * @function mapRawDataForDateRanges
 * @param {[string, CsvDataRow[]]} groupKv - an array representation of a map entry
 * @param {number} index
 * @returns {DateRangeStatistics}
 */
function mapRawDataForDateRangesWithMinPlayers([key, entries], i) {
  return {
    key,
    entries,
    entriesCount: entries.length,
    // bin values which take the form of minAgeCount_1, collects separated versions of the min age count
    ...entries.reduce((acc, el) => {
      const key = `minPlayersCount_${el.minPlayers}`;

      if (!acc[key]) acc[key] = 1
      acc[key]++;

      return acc;
    }, {})
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
  console.log('stacked data: ', data)

  // TODO need to solve the parsing throught the stacked data structure
  // TODO these are the portions that will help with the data
  // .attr("x", function (d) { return x(d.data.group); })
  // .attr("y", function (d) { return y(d[1]); })
  // .attr("height", function(d) { return y(d[0]) - y(d[1]); })

  // d3.stack().keys(get(2).columns).value(([, group], key) => group.get(key).length)(d3.index(data, d => d['Year Published']))

  let bars = getSvg()
    .selectAll(".bar")
    .data(data, d => d.data.key)
    .join(
      enter => enter.append('rect')
        .attr("class", "bar")
        // .attr('x', d => x(d.bin))
        // TODO this data.group is the access of the column thus we want to change this to search for the range
        .attr("x", function (d, i) { return x(d[i].data.key); }) // TODO map this correctly to the positional value, I think it's key still
        .attr('width', x.bandwidth())
        // TODO transition this to use margin?
        .attr('y', _ => HEIGHT - 100)
        .attr('height', _ => 0)
        // TODO move these to styles? These will not work with stacks?
        .attr("fill", d => color(d.key)) // TODO this needs to change to the correct value
        .attr("stroke", "#000035")
        .attr("stroke-width", 1)
        // animate the new elements added
        .transition()
        .duration(DURATION)
        .ease(d3.easeExpIn)
        // .attr("y", function (d) { return y(d.count); })
        .attr("y", function (d) { return y(d[0]); }) // TODO map this correctly to the positional value // TODO should probably be using d[0] only
        // TODO transition this to use margin?
        .attr("height", _ => 0) //return y(d[0]) - y(d[1])
        .delay(function (d, i) { return (i * 50) }),
      update => update.transition()
        .duration(DURATION)
        .ease(d3.easeExpIn)
        .attr("y", function (d) { return y(d[0]) - y(d[1]); }) //TODO should be d[1] - d[0] ish
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
  /** @type {CsvDataRow[]} */
  const table = get(2).map(mapRawData);

  // use thi
  const yearRanges = [
    ...d3.pairs(YEAR_THRESHOLDS.slice(0, YEAR_THRESHOLDS.indexOf(2015))),
    ...d3.range(2014, 2021).map(el => [el, el])
  ];
  const yearKeys = yearRanges.map(formatExtentToBin);

  const yearRangeBins = d3.group(table, d => {
    const groupId = yearRanges.findIndex(([min, max]) => {
      const year = d.yearPublished;

      if (min == max && year == min) return true;

      return year >= min && year < max
    });
    return yearKeys[groupId];
  })

  // TODO this is not working as expected, need to probably do a custom map instead of rollup.
  // const yearRangeBinStats = Array.from(yearRangeBins).map()

  // Format bins with stats custom for this stacking
  /** @type {DateRangeStatistics[]} */
  const yearRangeBinStats = Array.from(yearRangeBins).filter(([key,]) => key).map(mapRawDataForDateRangesWithMinPlayers);
  // Keys for all the min players keys
  const minPlayerStackKeys = Array.from(new Set(...yearRangeBinStats.map(Object.keys))).filter(el => el !== 'key' && el !== 'entries' && el !== 'entriesCount')
  minPlayerStackKeys.sort((a, b) => Number(a.split('_')[1]) - Number(b.split('_')[1])); // sort keys for correct stack alignment

  // TODO I can set the values that don't exist from  NaN/undefined to 0. Or filter out the values?

  // Stacked data based on bin stats and the keys
  const stackedData = d3.stack().keys(minPlayerStackKeys)(yearRangeBinStats).map(row => {
    return row.map(el => {
      if (Number.isNaN(el[0])) el[0] = 0;
      if (Number.isNaN(el[1])) el[1] = el[0];
      return el;
    })
  });

  // Get the max of all the maxes
  const maxCount = Math.ceil(d3.max(yearRangeBinStats.map(el => el.entriesCount)) / 10) * 10; // TODO wait we need to get the max y in this case I might need to make this a different value

  // scales
  let x = d3.scaleBand().domain(yearKeys).range([100, WIDTH - 100])
  let y = d3.scaleLinear().domain([0, maxCount]).range([HEIGHT - 100, 100])

  // color palette = one color per subgroup
  let color = d3.scaleOrdinal()
    .domain(minPlayerStackKeys) // colors correspond to the
    .range(COLOR_PALETTE)
    .unknown('#ccc')

  let bars;

  // trigger renders
  renderXAxis(x);
  renderYAxis(y);
  ({ bars, x, y, color } = renderStackedBarPlot(stackedData, x, y, color));

  // TODO NaN needs to be set to 0 or not rendered?

  return {
    bars,
    x,
    y,
    color,
  };
}

/**
 * Scatterplot to display data in a way with more pivotable characteristics.
 */
function renderFinalScatterplot() {

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
    return renderFinalScatterplot()
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
