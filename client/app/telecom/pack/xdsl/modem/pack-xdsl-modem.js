angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.modem", {
        url: "/modem",
        views: {
            "xdslView@telecom.pack.xdsl": {
                templateUrl: "app/telecom/pack/xdsl/modem/pack-xdsl-modem.html",
                controller: "XdslModemCtrl",
                controllerAs: "XdslModem"
            },
            "bridgeModeView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/bridgeMode/pack-xdsl-modem-bridgeMode.html",
                controller: "XdslModemBridgeModeCtrl",
                controllerAs: "BridgeCtrl"
            },
            "connectedDeviceView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/connectedDevices/pack-xdsl-modem-connectedDevices.html",
                controller: "XdslModemConnectedDevicesCtrl",
                controllerAs: "DeviceCtrl"
            },
            "dmzView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/dmz/pack-xdsl-modem-dmz.html",
                controller: "XdslModemDmzCtrl",
                controllerAs: "DmzCtrl"
            },
            "firewallView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/firewall/pack-xdsl-modem-firewall.html",
                controller: "XdslModemFirewallCtrl",
                controllerAs: "FirewallCtrl"
            },
            "managedByOvhView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/managedByOvh/pack-xdsl-modem-managedByOvh.html",
                controller: "XdslModemManagedByCtrl",
                controllerAs: "ManagedByCtrl"
            },
            "mtuView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/mtu/pack-xdsl-modem-mtu.html",
                controller: "XdslModemMtuCtrl",
                controllerAs: "MtuCtrl"
            },
            "modemRebootView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/reboot/pack-xdsl-modem-reboot.html",
                controller: "XdslModemRebootCtrl",
                controllerAs: "RebootCtrl"
            },
            "modemResetView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/reset/pack-xdsl-modem-reset.html",
                controller: "XdslModemResetCtrl",
                controllerAs: "ResetCtrl"
            },
            "routerView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/pack-xdsl-modem-router.html",
                controller: "XdslModemRouterCtrl",
                controllerAs: "RouterCtrl"
            },
            "routerBdhcpView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/dhcp/bdhcp/pack-xdsl-modem-dhcp-bdhcp.html",
                controller: "XdslModemDhcpBdhcpCtrl",
                controllerAs: "BdhcpCtrl"
            },
            "routerDhcpView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/dhcp/pack-xdsl-modem-dhcp.html",
                controller: "XdslModemDhcpCtrl",
                controllerAs: "DhcpCtrl"
            },
            "routerLanView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/lan/pack-xdsl-modem-lan.html",
                controller: "XdslModemLanCtrl",
                controllerAs: "LanCtrl"
            },
            "routerPortView@telecom.pack.xdsl.modem": {
                templateUrl: "app/telecom/pack/xdsl/modem/router/ports/pack-xdsl-modem-ports.html",
                controller: "XdslModemPortsCtrl",
                controllerAs: "PortCtrl"
            },
            "wifiView@telecom.pack.xdsl.modem": {
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
