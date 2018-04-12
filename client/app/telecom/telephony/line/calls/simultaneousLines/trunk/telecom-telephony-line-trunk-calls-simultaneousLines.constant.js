angular.module("managerApp").constant("TRUNK_PACK_DETAILS", {
    chart: {
        type: "bar",
        options: {
            animation: {
                duration: 0,
                onComplete: function () {
                    var dataOffset = 0.1;
                    var chartInstance = this.chart;
                    var ctx = chartInstance.ctx;

                    ctx.textAlign = "center";
                    ctx.fillStyle = "rgba(0, 0, 0, 1)";
                    ctx.textBaseline = "bottom";

                    this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        var portraitFormat = window.innerHeight > window.innerWidth;
                        meta.data.forEach(function (bar, index) {
                            var data = dataset.data[index] - dataOffset;
                            var label = portraitFormat ? data : data + (data > 1 ? " packs" : " pack");
                            ctx.fillText(label, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            },
            events: [],
            legend: {
                display: true,
                position: "bottom"
            },
            responsive: true,
            scales: {
                xAxes: [
                    {
                        display: true,
                        gridLines: {
                            offsetGridLines: true,
                            display: false
                        },
                        position: "bottom",
                        ticks: {
                            mirror: true
                        },
                        type: "category"
                    }
                ],
                yAxes: [
                    {
                        display: false,
                        position: "left",
                        ticks: {
                            beginAtZero: true,
                            max: 2.3
                        }
                    }
                ]
            },
            tooltips: {
                enabled: false
            }
        }
    }
});
