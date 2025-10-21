import React, { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    
    var dataSource = {
      datasets: [{ data: [], backgroundColor: ['#ffcd56','#ff6384','#36a2eb','#fd6b19'] }],
      labels: []
    };

    function createChart() {
      var el = document.getElementById('myChart');
      if (!el || !window.Chart) return;
      var ctx = el.getContext('2d');
      // eslint-disable-next-line no-undef
      new Chart(ctx, { type: 'pie', data: dataSource });
    }

    function getBudget() {
      // eslint-disable-next-line no-undef
      axios.get('http://localhost:3000/budget') // <-- change to your droplet if needed
        .then(function (res) {
          for (var i = 0; i < res.data.myBudget.length; i++) {
            dataSource.datasets[0].data[i] = res.data.myBudget[i].budget;
            dataSource.labels[i] = res.data.myBudget[i].title;
          }
          createChart();
        })
        .catch(function (err) { console.error('Budget fetch failed:', err); });
    }

    getBudget();

    // ===== D3 v3 animated donut (exact demo behavior) =====
    var d3v3 = window.d3;
    var host = document.getElementById('d3donut-wrap');
    if (!d3v3 || !host) return;

    (function () {
      var el     = d3v3.select('#d3donut-wrap'),
          width  = 960,
          height = 450,
          radius = Math.min(width, height) / 2;

      var svg = el.append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .append('g')
          .attr('transform', `translate(${width/2},${height/2})`);

      svg.append('g').attr('class', 'slices');
      svg.append('g').attr('class', 'labels');
      svg.append('g').attr('class', 'lines');

      var color = d3v3.scale.ordinal()
        .domain(['Eat out','Rent','Grocery','Utilities','Transport','Savings','Fun'])
        .range(['#98abc5','#8a89a6','#7b6888','#6b486b','#a05d56','#d0743c','#ff8c00']);

      var pie = d3v3.layout.pie()
        .sort(null)
        .value(function(d){ return d.value; });

      var arc = d3v3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

      var outerArc = d3v3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

      var fmt = d3v3.format('.0f');
      function midAngle(d){ return d.startAngle + (d.endAngle - d.startAngle)/2; }
      function key(d){ return d.data.label; }

      function draw(data) {
        var slice = svg.select('.slices').selectAll('path.slice').data(pie(data), key);

        slice.enter().append('path')
          .attr('class','slice')
          .style('fill', function(d){ return color(d.data.label); });

        slice.transition().duration(1000)
          .attrTween('d', function(d){
            this._current = this._current || d;
            var i = d3v3.interpolate(this._current, d);
            this._current = i(0);
            return function(t){ return arc(i(t)); };
          });

        slice.exit().remove();

        var text = svg.select('.labels').selectAll('text').data(pie(data), key);
        text.enter().append('text').attr('dy', '.35em');

        text.text(function(d){ return d.data.label + ' (' + fmt(d.data.value) + ')'; })
          .transition().duration(1000)
          .attrTween('transform', function(d){
            this._current = this._current || d;
            var i = d3v3.interpolate(this._current, d);
            this._current = i(0);
            return function(t){
              var d2 = i(t), pos = outerArc.centroid(d2);
              pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
              return 'translate(' + pos + ')';
            };
          })
          .styleTween('text-anchor', function(d){
            this._current = this._current || d;
            var i = d3v3.interpolate(this._current, d);
            this._current = i(0);
            return function(t){
              var d2 = i(t);
              return midAngle(d2) < Math.PI ? 'start' : 'end';
            };
          });

        text.exit().remove();

        var polyline = svg.select('.lines').selectAll('polyline').data(pie(data), key);
        polyline.enter().append('polyline');

        polyline.transition().duration(1000)
          .attrTween('points', function(d){
            this._current = this._current || d;
            var i = d3v3.interpolate(this._current, d);
            this._current = i(0);
            return function(t){
              var d2  = i(t), pos = outerArc.centroid(d2);
              pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
              return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
          });

        polyline.exit().remove();
      }

      function loadRealData(cb){
        // eslint-disable-next-line no-undef
        d3.json('http://localhost:3000/budget', function(err, json){
          if (err) { console.error('D3 load failed:', err); return; }
          var data = json.myBudget.map(function(d){
            return { label: d.title, value: +d.budget };
          });
          cb(data);
        });
      }

      function randomize(data){
        return data.map(function(d){
          return { label: d.label, value: Math.max(1, d.value * (0.6 + Math.random()*0.8)) };
        });
      }

      loadRealData(function(data){
        draw(data);
        var btn = document.getElementById('randomize');
        if (btn) btn.addEventListener('click', function(){ draw(randomize(data)); });
      });
    })();
  }, []);

  return (
    <main className="center" id="main" tabIndex={-1}>
      <section className="page-area" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">App Features</h2>

        <article>
          <h3>Stay on track</h3>
          <p>
            Do you know where you are spending your money? If you really stop to track it down,
            you would get surprised! Proper budget management depends on real data... and this
            app will help you with that!
          </p>
        </article>

        <article>
          <h3>Alerts</h3>
          <p>What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.</p>
        </article>

        <article>
          <h3>Results</h3>
          <p>
            People who stick to a financial plan, budgeting every expense, get out of debt faster!
            Also, they live happier lives... since they spend without guilt or fear...
            because they know it is all good and accounted for.
          </p>
        </article>

        <article>
          <h3>Free</h3>
          <p>This app is free!!! And you are the only one holding your data!</p>
        </article>

        <article>
          <h3>D3 Bar Chart</h3>
          <div id="d3chart" role="img" aria-label="Bar chart of budget categories"></div>
        </article>

        <article>
          <h3>D3 Donut Chart</h3>
          <button id="randomize" type="button">Randomize</button>
          <div id="d3donut-wrap" role="img" aria-label="Donut chart of budget categories"></div>
        </article>

        <article>
          <h3>Chart</h3>
          <figure>
            <canvas id="myChart" width="400" height="400" role="img" aria-describedby="chart-desc"></canvas>
            <figcaption id="chart-desc">Pie chart showing your budget categories and allocations.</figcaption>
          </figure>
        </article>
      </section>
    </main>
  );
}
