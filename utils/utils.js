import fetch from "node-fetch";

/**
 *
 * @param {string} str
 * @returns
 */
export function parseNumberString(str) {
  const lastCharactor = str[str.length - 1];
  const strShortened = str.slice(0, -1);
  if (lastCharactor === "K") {
    return parseFloat(strShortened) * 1000;
  } else if (lastCharactor === "M") {
    return parseFloat(strShortened) * 1000000;
  } else if (lastCharactor === "B") {
    return parseFloat(strShortened) * 1000000000;
  } else {
    return parseInt(str);
  }
}

/**
 * Expected metric format: { name: "metric-name", tags: [{ name: "tag-name", value: "tag-value" }], fields: [{ name: "field-name", value: "field-value" }] }
 * @param {[]} metrics
 * @returns
 */
export async function pushInfluxMetrics(
  metrics,
  grafanaCloudInfluxUrl,
  grafanaCloudId,
  grafanaCloudAPIKey
) {
  let metricStrings = [];
  for (const metric of metrics) {
    // format: metric,tag1=value1,tag2=value2 field1=value1,field2=value2
    const tagString = metric.tags
      .map((tag) => `${tag.name}=${tag.value}`)
      .join(",");
    const fieldString = metric.fields
      .map((field) => `${field.name}=${field.value}`)
      .join(",");
    metricStrings.push(`${metric.name},${tagString} ${fieldString}`);
  }

  console.log("Pushing metrics to InfluxDB: " + metricStrings.join("\n"));
  const response = await fetch(grafanaCloudInfluxUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${grafanaCloudId}:${grafanaCloudAPIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metricStrings.join("\n")),
  }).catch((err) => {
    console.log(err);
  });
  console.log(response.status);
  return response;
}
