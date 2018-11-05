function graphIt(teams, dots, rects){
  const svgg = document.getElementById('mtsbchart');
  const w = svgg.getBoundingClientRect().width;
  const h = 200;
  // set up size
  const margin = { top: 50, right: 30, bottom: 20, left: 30 };
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const colorD = d3.map(teams, function(d) { return d.name });

  color.domain(colorD);

  const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);
  const g = svg
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  const minVal = d3.min(dots, function(c) { return c.ontask; });
  const maxVal = d3.max(dots, function(c) { return c.ontask; });
  const xdomain = teams[0].lighthouse.map(function(d){return d.index + 1});
  // xscale
  const x = d3.scalePoint().range([0,width]);
  const y = d3.scaleLinear().range([height, 0]);

  const line = d3.line()
  .x(function (d, i) {
    return x(d.index + 1);
  })
  .y(function (d, i) {
    return y(d.ontask);
  });

  x.domain(
    xdomain
  )
  y.domain(
    [0, 1]
  );

  const xAxis = d3.axisBottom(x)
  g.append('g').attr('class', 'x axis')
  .attr('transform', 'translate(0,' + height + ')')
  .call(xAxis);
  g.append('g').attr('class', 'y axis')
  .call(d3.axisLeft(y));
    const measurement = 
    g.selectAll('.measurement')
    .data(teams)
    .enter().append('g')
    .attr('class', 'measurement');

  const path = measurement.append('path')
    .attr('class', 'line')
    .attr('d', function (d, i) {
      return line(d.lighthouse);
    }).style('stroke', function (d, i) {
      return color(d.name);
    })

  const label = measurement.append('text')
    .attr('x', width + 16 )
    .attr('y', function(d, i){
      return y(d.lighthouse[d.lighthouse.length-1].ontask) + 16
    })
    .attr('dy', '.35em')
    .text(function (d, i) {
      return d.name.toUpperCase();
    })
    .attr('text-anchor', 'end');

  const dot = 
  g.selectAll('.dot')
  .data(dots)
  .enter().append('svg:circle')
  .attr('class', 'dot')
  .attr('cx', function(d, i) {
    return x(d.index+1)
  })
  .attr('cy', function(d, i) { 
    return y(d.ontask)
  })
  .attr('r', 6)
  .style('fill', color('TS'))
}