/**
 * Calls filtering table component.
 *
 * Component API input :
 *   fetchAll: function to fetch all the items to load & display (must return a promise).
 *   remove: function to delete an item given its id (must return a promise).
 *
 * Component API output :
 *   update: refresh the component when called.
 *   getList: returns the component's list of items.
 *
 */
angular.module("managerApp").component("telecomTelephonyCallsFilteringTable", {
    bindings: {
        api: "="
    },
    templateUrl: "components/telecom/telephony/callsFiltering/telecom-telephony-callsFilteringTable.html",
    controller: function ($scope, $timeout, $filter, $q, $translate, $translatePartialLoader, Toast, ToastError) {
        "use strict";

        var self = this;

        self.$onInit = function () {

            self.screenLists = {
                raw: [],
                paginated: null,
                sorted: null,
                selected: {},
                orderBy: "callNumber",
                orderDesc: false,
                filterBy: {
                    list: undefined,
                    type: undefined
                },
                isDeleting: false,
                isTaskInProgress: false
            };

            self.poller = $timeout(self.refreshScreenListsPoller, 2000);
            $scope.$on("$destroy", function () {
                $timeout.cancel(self.poller);
            });

            self.api.update = function () {
                self.updateScreenList();
            };

            self.api.getList = function () {
                return angular.copy(self.screenLists.raw);
            };

            $translatePartialLoader.addPart("../components/telecom/telephony/callsFiltering");
            return $translate.refresh().finally(function () {
                self.isInitialized = true;
                return self.refresh();
            });
        };

        self.refresh = function () {
            self.isLoading = true;
            return self.updateScreenList().catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.isLoading = false;
            });
        };

        self.refreshScreenListsPoller = function () {
            return self.updateScreenList().finally(function () {
                self.poller = $timeout(self.refreshScreenListsPoller, 5000);
            });
        };

        self.getSelection = function () {
            return _.filter(self.screenLists.raw, function (screen) {
                return screen && screen.status !== "delete" && self.screenLists.selected && self.screenLists.selected[screen.id];
            });
        };

        self.exportSelection = function () {
            return _.map(self.getSelection(), function (filter) {
                return _.pick(filter, ["callNumber", "nature", "type"]);
            });
        };

        self.updateScreenList = function () {
            return self.api.fetchAll().then(function (result) {
                if (result.length === self.screenLists.raw.length) {
                    // update
                    _.each(result, function (screen) {
                        var toUpdate = _.find(self.screenLists.raw, { id: screen.id });
                        if (toUpdate) {
                            _.assign(toUpdate, screen);
                        } else {
                            self.screenLists.raw.push(screen);
                        }
                    });
                } else {
                    self.screenLists.raw = result;
                }
                self.sortScreenLists();
                self.screenLists.isTaskInProgress = _.filter(self.screenLists.raw, { status: "active" }).length !== self.screenLists.raw.length;
            });
        };

        self.removeSelectedScreenLists = function () {
            var screenLists = self.getSelection();
            var queries = screenLists.map(self.api.remove);
            self.screenLists.isDeleting = true;
            queries.push($timeout(angular.noop, 500)); // avoid clipping
            Toast.info($translate.instant("telephony_calls_filtering_table_status_delete_success"));
            return $q.all(queries).then(function () {
                self.screenLists.selected = [];
                return self.updateScreenList();
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.screenLists.isDeleting = false;
            });
        };

        self.sortScreenLists = function () {
            var data = angular.copy(self.screenLists.raw);
            data = $filter("filter")(data, self.screenLists.filterBy);
            data = $filter("orderBy")(
                data,
                self.screenLists.orderBy,
                self.screenLists.orderDesc
            );
            self.screenLists.sorted = data;

            // avoid pagination bug ...
            if (self.screenLists.sorted.length === 0) {
                self.screenLists.paginated = [];
            }
        };

        self.orderScreenListsBy = function (by) {
            if (self.screenLists.orderBy === by) {
                self.screenLists.orderDesc = !self.screenLists.orderDesc;
            } else {
                self.screenLists.orderBy = by;
            }
            self.sortScreenLists();
        };
    }
});

