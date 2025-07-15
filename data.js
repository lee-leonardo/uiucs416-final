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
}

/**
 * @function gateData
 * @description gets data and clones the value.
 */
function getData(step) {
  return data[step].clone();
}
