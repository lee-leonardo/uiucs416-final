let triggered = false;
const data = []

/**
 * @function initData
 * @description initializes the data and appends it to the data array
 */
async function initData() {
  // Prevent from happening more than once
  if (triggered) return;
  triggered = true;

  // Asynchronously pull the data for clonging
  data.push(await d3.csv('/data/step_1.csv'))
  data.push(await d3.csv('/data/step_2.csv'))
  data.push(await d3.csv('/data/BGG_Data_Set_original.csv'));

  window.DOMAIN_ORDINAL = Array.from(d3.union(data[2].flatMap(e => e['Domains'].split(', '))))
  window.DOMAIN_ORDINAL.sort()
}

/**
 * @function gateData
 * @description gets data and clones the value.
 */
function getData(step) {
  return data[step].clone();
}
