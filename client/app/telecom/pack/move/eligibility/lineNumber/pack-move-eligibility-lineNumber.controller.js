angular.module("managerApp").component("packMoveEligibilityLineNumber", {
    bindings: {
        offers: "=?",
        offersChange: "&",
        submited: "&",
        method: "=?"
    },
    templateUrl: "app/telecom/pack/move/eligibility/lineNumber/pack-move-eligibility-lineNumber.html",
    controllerAs: "PackMoveEligibilityPhoneNumber",
    controller: function ($scope, $stateParams, $filter, $translate, ToastError, Toast, OvhApiPackXdslMove) {
        "use strict";

        var self = this;
        this.phoneNumberRegex = "^0[1-5]([\\s\\-]?([0-9]){2}){4}$";

        this.updateLineAccessibility = function () {
            this.loading = true;
            this.lineNumber = self.testLine.lineNumber.replace(/[^0-9]/g, "");
            self.submited();
            return OvhApiPackXdslMove.v6().pollElligibility($scope, {
                packName: $stateParams.packName,
                lineNumber: self.lineNumber
            }).then(
                function (data) {
                    if (data.error) {
                        self.offersChange({ OFFERS: [] });
                        return new ToastError(data, data.error);
                    }
                    if (angular.isDefined(data.result.offers)) {
                        _.extend(self.testLine, data);
                        self.offers = _.isArray(data.result.offers) ? data.result.offers : [];

                        if (self.offers.length === 0) {
                            Toast.error($translate.instant("pack_move_eligibility_no_offers", { number: self.lineNumber }));
                        }
                    }
                    self.offers.forEach(function (offer) {
                        offer.lineNumber = self.lineNumber;
                        if (offer.meetingSlots) {
                            offer.meetingSlots.calendarData = [offer.meetingSlots.meetingSlots.map(function (slot) {
                                return {
                                    tooltip: [$filter("date")(slot.startDate, "HH:mm"), $filter("date")(slot.endDate, "HH:mm")].join(" - "),
                                    title: "",
                                    start: slot.startDate,
                                    end: slot.endDate,
                                    data: slot
                                };
                            })];
                            offer.meetingSlots.firstSlot = _.head(_.sortBy(offer.meetingSlots.meetingSlots, ["startDate"]));
                        }
                    });
                    self.offersChange({ OFFERS: self.offers });
                    return data;
                },
                function () {
                    return new ToastError($translate.instant("pack_move_eligibility_error"));
                }).finally(function () {
                    self.loading = false;
                }
            );
        };

    }
});
