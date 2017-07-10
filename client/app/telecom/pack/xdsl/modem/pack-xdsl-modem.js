angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.modem", {
        url: "/modem",
        views: {
            xdslView: {
                templateUrl: "app/telecom/pack/xdsl/modem/pack-xdsl-modem.html",
                controller: "XdslModemCtrl",
                controllerAs: "XdslModem"
            },
            "@bridgeModeView": {
                templateUrl: "app/telecom/pack/xdsl/modem/bridgeMode/pack-xdsl-modem-bridgeMode.html",
                controller: "XdslModemBridgeModeCtrl",
                controllerAs: "BridgeCtrl"
            },
            "@connectedDeviceView": {
                templateUrl: "app/telecom/pack/xdsl/modem/connectedDevices/pack-xdsl-modem-connectedDevices.html",
                controller: "XdslModemConnectedDevicesCtrl",
                controllerAs: "DeviceCtrl"
            },
            "@dmzView": {
                templateUrl: "app/telecom/pack/xdsl/modem/dmz/pack-xdsl-modem-dmz.html",
                controller: "XdslModemDmzCtrl",
                controllerAs: "DmzCtrl"
            },
            "@firewallView": {
                templateUrl: "app/telecom/pack/xdsl/modem/firewall/pack-xdsl-modem-firewall.html",
                controller: "XdslModemFirewallCtrl",
                controllerAs: "FirewallCtrl"
            },
            "@managedByOvhView": {
                templateUrl: "app/telecom/pack/xdsl/modem/managedByOvh/pack-xdsl-modem-managedByOvh.html",
                controller: "XdslModemManagedByCtrl",
                controllerAs: "ManagedByCtrl"
            },
            "@mtuView": {
                templateUrl: "app/telecom/pack/xdsl/modem/mtu/pack-xdsl-modem-mtu.html",
                controller: "XdslModemMtuCtrl",
                controllerAs: "MtuCtrl"
            },
            "@modemRebootView": {
                templateUrl: "app/telecom/pack/xdsl/modem/reboot/pack-xdsl-modem-reboot.html",
                controller: "XdslModemRebootCtrl",
                controllerAs: "RebootCtrl"
            },
            "@modemResetView": {
                templateUrl: "app/telecom/pack/xdsl/modem/reset/pack-xdsl-modem-reset.html",
                controller: "XdslModemResetCtrl",
                controllerAs: "ResetCtrl"
            },
            "@routerView": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/pack-xdsl-modem-router.html",
                controller: "XdslModemRouterCtrl",
                controllerAs: "RouterCtrl"
            },
            "@routerBdhcpView": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/dhcp/bdhcp/pack-xdsl-modem-dhcp-bdhcp.html",
                controller: "XdslModemDhcpBdhcpCtrl",
                controllerAs: "BdhcpCtrl"
            },
            "@routerDhcpView": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/dhcp/pack-xdsl-modem-dhcp.html",
                controller: "XdslModemDhcpCtrl",
                controllerAs: "DhcpCtrl"
            },
            "@routerLanView": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/lan/pack-xdsl-modem-lan.html",
                controller: "XdslModemLanCtrl",
                controllerAs: "LanCtrl"
            },
            "@routerPortView": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/ports/pack-xdsl-modem-ports.html",
                controller: "XdslModemPortsCtrl",
                controllerAs: "PortCtrl"
            },
            "@wifiView": {
                templateUrl: "app/telecom/pack/xdsl/modem/wifi/pack-xdsl-modem-wifi.html",
                controller: "XdslModemWifiCtrl",
                controllerAs: "WifiCtrl"
            }
        },
        translations: [
            "common",
            "telecom/pack/xdsl",
            "telecom/pack/xdsl/modem",
            "telecom/pack/xdsl/modem/connectedDevices",
            "telecom/pack/xdsl/modem/bridgeMode",
            "telecom/pack/xdsl/modem/dmz",
            "telecom/pack/xdsl/modem/firewall",
            "telecom/pack/xdsl/modem/managedByOvh",
            "telecom/pack/xdsl/modem/mtu",
            "telecom/pack/xdsl/modem/reboot",
            "telecom/pack/xdsl/modem/reset",
            "telecom/pack/xdsl/modem/router/dhcp",
            "telecom/pack/xdsl/modem/router/dhcp/bdhcp",
            "telecom/pack/xdsl/modem/router/lan",
            "telecom/pack/xdsl/modem/router/ports",
            "telecom/pack/xdsl/modem/wifi"
        ]
    });
});
