angular.module('managerApp').constant('PACK_XDSL_STATISTICS', {
  chart: {
    type: 'line',
    data: {
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom',
        display: true,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      tooltips: {
        mode: 'label',
        intersect: false,
        callbacks: {
          title(data) {
            const timestamp = moment(_.get(_.first(data), 'xLabel'));
            return timestamp.fromNow();
          },
        },
      },
      scales: {
        yAxes: [{
          display: true,
          position: 'left',
          scaleLabel: {
            display: true,
          },
          gridLines: {
            drawBorder: true,
            display: false,
          },
        }],
        xAxes: [{
          type: 'time',
          position: 'bottom',
          gridLines: {
            drawBorder: true,
            display: false,
          },
        }],
      },
      pan: {
        enabled: true,
        mode: 'xy',
        speed: 10,
        threshold: 10,
      },
      zoom: {
        enabled: true,
        mode: 'xy',
        drag: false,
        limits: {
          max: 10,
          min: 0.5,
        },
      },
    },
  },
});
