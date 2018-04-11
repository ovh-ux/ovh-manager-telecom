angular.module("managerApp").controller("XdslAccessIpCtrl", function ($stateParams, OvhApiXdslIps, ToastError, IpAddress) {
    "use strict";

    var self = this;
    this.validator = validator;
    this.ips = [];

    /**
     * Initialize the controller
     */
    this.init = function () {
        self.xdslId = $stateParams.serviceName;
        self.ipBlock = decodeURIComponent($stateParams.block);
        self.loading = true;

        // Get notification number
        OvhApiXdslIps.Aapi().reverse({
            ipBlock: $stateParams.block
        }).$promise.then(function (ips) {
            self.ips = ips;
            self.loading = false;
        }, function (err) {
            self.loading = false;
            return new ToastError(err);
        });

    };

    /**
     * Check if the IP is valid regarding the range
     * @param {String} ip IP to validate
     * @returns {Boolean}
     */
    this.checkIp = function (ip) {
        var ipv4 = IpAddress.address4(ip);
        if (!ipv4.isValid()) {
            return false;
        }
        var range = IpAddress.address4(decodeURIComponent($stateParams.block));
        if (!range.isValid()) {
            return false;
        }
        return ipv4.isInSubnet(range);
    };

    /**
     * Check if a new IP can be added
     * @returns {boolean}
     */
    this.canAdd = function () {
        return !_.find(self.ips, { editing: true });
    };

    /**
     * Add a new line in the table
     */
    this.add = function () {
        this.ips.push({
            ipReverse: "",
            reverse: "",
            ipBlock: $stateParams.block,
            editing: true
        });
    };

    /**
     * Undo the creation of a reverse
     * @param {Object} ip Reverse to undo
     */
    this.undo = function (ip) {
        var index = self.ips.indexOf(ip);
        if (index !== -1) {
            self.ips.splice(index, 1);
        }
    };

    /**
     * Delete a reverse DNS
     * @param {Object} ip Reverse to delete
     */
    this.delete = function (ip) {
        ip.updating = true;
        OvhApiXdslIps.v6().deleteReverse({
            ipBlock: decodeURIComponent($stateParams.block),
            ipReverse: ip.ipReverse
        }, null).$promise.then(function () {
            self.undo(ip);
        }, function (err) {
            ip.updating = false;
            return new ToastError(err);
        });
    };

    /**
     * create a reverse DNS
     * @param {Object} ip Reverse to create
     */
    this.create = function (ip) {
        ip.updating = true;
        OvhApiXdslIps.v6().createReverse({
            ipBlock: decodeURIComponent($stateParams.block)
        }, {
            ipReverse: ip.ipReverse,
            reverse: ip.reverse
        }).$promise.then(function () {
            delete ip.editing;
            delete ip.updating;
        }, function (err) {
            delete ip.updating;
            return new ToastError(err);
        });
    };

    /**
     * Refresh the sort of the list of IPs
     */
    this.refresh = function () {
        self.ips.sort(function (a, b) {
            if (a[self.sortBy] > b[self.sortBy]) {
                return self.revertSort ? -1 : 1;
            }
            if (a[self.sortBy] < b[self.sortBy]) {
                return self.revertSort ? 1 : -1;
            }
            return 0;
        });
    };

    this.init();

});
