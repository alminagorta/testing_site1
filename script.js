const margin = { top: 20, right: 40, bottom: 40, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select(".tooltip");

// Parse the date
const parseTime = d3.timeParse("%Y-%m-%d");

d3.csv("data.csv").then(function(data) {
  // Format the data
  data.forEach(d => {
    d.date = parseTime(d.date);
    d.value = +d.value;
  });

  // Set the scales
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)))
    .selectAll(".tick text")
    .attr("class", "axis-label");

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll(".tick text")
    .attr("class", "axis-label");

  // Create the line function
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  // Add the line path
  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line);

  // Add circles to the line (interactive)
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .text(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)} | Value: ${d.value}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

  // Dynamic update function (for example, based on button click or new data arrival)
  function updateChart(newData) {
    // Re-parse and reformat the new data
    newData.forEach(d => {
      d.date = parseTime(d.date);
      d.value = +d.value;
    });

    // Update scales
    x.domain(d3.extent(newData, d => d.date));
    y.domain([0, d3.max(newData, d => d.value)]);

    // Update the line
    svg.select(".line")
      .data([newData])
      .transition()
      .duration(750)
      .attr("d", line);

    // Update the circles
    const circleUpdate = svg.selectAll("circle")
      .data(newData);

    circleUpdate.enter()
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .merge(circleUpdate)
      .transition()
      .duration(750)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value));

    circleUpdate.exit().remove();
  }

  // Example of dynamically updating the chart with new data (can be triggered by a button or external event)
  setTimeout(() => {
    const newData = [
      { date: "2023-01-08", value: 110 },
      { date: "2023-01-09", value: 95 },
      { date: "2023-01-10", value: 80 }
    ];
    updateChart(newData);
  }, 5000);
});