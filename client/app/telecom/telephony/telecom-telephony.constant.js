(function () {
  angular.module('managerApp').constant('TELEPHONY_INFRASTRUCTURE_OPTIONS', {
    instanceOptions: {
      PaintStyle: {
        lineWidth: 2,
        strokeStyle: '#354291',
      },
      HoverPaintStyle: {
        lineWidth: 4,
        strokeStyle: '#354291',
      },
      ConnectionsDetachable: false,
      EndpointStyle: {
        fillStyle: 'transparent',
      },
      MaxConnections: -1,
    },
    endpointOptions: {
      bottom: {
        source: {
          anchor: [0.5, 0.5, 0, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, 0, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
      top: {
        source: {
          anchor: [0.5, 0.5, 0, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, 0, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
      topLeft: {
        source: {
          anchor: [0.5, 0.5, -1, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, -1, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
      bottomRight: {
        source: {
          anchor: [0.5, 0.5, 1, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, 1, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
    },
  }).constant('TELEPHONY_INFRASTRUCTURE_OPTIONS', {
    instanceOptions: {
      PaintStyle: {
        lineWidth: 2,
        strokeStyle: '#354291',
      },
      HoverPaintStyle: {
        lineWidth: 4,
        strokeStyle: '#354291',
      },
      ConnectionsDetachable: false,
      EndpointStyle: {
        fillStyle: 'transparent',
      },
      MaxConnections: -1,
    },
    endpointOptions: {
      bottom: {
        source: {
          anchor: [0.5, 0.5, 0, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, 0, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
      top: {
        source: {
          anchor: [0.5, 0.5, 0, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, 0, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
      topLeft: {
        source: {
          anchor: [0.5, 0.5, -1, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, -1, -1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
      bottomRight: {
        source: {
          anchor: [0.5, 0.5, 1, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
        target: {
          anchor: [0.5, 0.5, 1, 1],
          connector: ['TwoSegments', { radius: 30 }],
        },
      },
    },
  }).constant('TELEPHONY_PHONEBOOK', {
    numberFields: [
      'homePhone',
      'homeMobile',
      'workPhone',
      'workMobile',
    ],
    emptyFields: {
      group: 'No group',
      numbers: '0033',
    },
  })
    .constant('TELEPHONY_RMA', {
      pdfBaseUrl: 'https://www.ovh.com/cgi-bin/telephony/rma.pl?reference=',
    })
    .constant('TELEPHONY_REPAYMENT_CONSUMPTION', {
      calledFeesPrefix: {
        fr: [
          '0033805',
        ],
        be: [
          '0032800',
        ],
      },
      groupRepaymentsPrefix: {
        fr: [
          '0033806',
          '003381',
          '003382',
          '003389',
        ],
        be: [
          '003278',
          '003270',
          '0032900',
          '0032902',
          '0032903',
          '0032904',
          '0032905',
          '0032906',
          '0032907',
        ],
      },
    });
}());
