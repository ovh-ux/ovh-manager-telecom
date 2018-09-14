angular.module('managerApp').constant('OVERTHEBOX_DETAILS', {
  chart: {
    options: {
      responsive: true,
      legend: {
        position: 'bottom',
        display: true,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            position: 'bottom',
            gridLines: {
              drawBorder: true,
              display: false,
            },
          },
        ],
        yAxes: [
          {
            display: true,
            position: 'left',
            scaleLabel: {
              display: true,
            },
            gridLines: {
              drawBorder: true,
              display: false,
            },
          },
        ],
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
      pan: {
        enabled: true,
        mode: 'xy',
        speed: 10,
        threshold: 10,
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'xy',
        limits: {
          max: 10,
          min: 0.5,
        },
      },
    },
  },
});
