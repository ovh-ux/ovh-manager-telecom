angular.module("managerApp").component("telecomTelephonyAliasMembers", {
    bindings: {
        api: "="
    },
    templateUrl: "components/telecom/telephony/alias/members/telecom-telephony-alias-members.html",
    controller: function ($q, $translate, $translatePartialLoader, Toast, ToastError) {
        "use strict";

        var self = this;

        self.$onInit = function () {

            self.loaders = {
                init: false,
                deleting: false
            };
            self.sortableMembersOpts = {
                handle: ".ovh-font-grip",
                start: function () {
                    self.membersBeforeDrag = angular.copy(self.members);
                },
                stop: self.onMoveMember,
                disabled: false
            };
            self.members = null;
            self.membersBeforeDrag = null;
            self.memberInEdition = null;
            self.memberToDelete = null;

            $translatePartialLoader.addPart("../components/telecom/telephony/alias/members");
            return $translate.refresh().finally(function () {
                self.isInitialized = true;
                return self.refreshMembers().catch(function (err) {
                    return new ToastError(err);
                }).finally(function () {
                    self.loaders.init = false;
                });
            });
        };

        self.api.addMembersToList = function (toAdd) {
            _.each(toAdd.reverse(), function (member) {
                self.members.unshift(member);
            });
            self.api.reorderMembers(self.members).then(function (orderedMembers) {
                self.members = orderedMembers;
            });
        };

        self.api.getMemberList = function () {
            return angular.copy(self.members);
        };

        self.refreshMembers = function () {
            self.members = null;
            return self.api.fetchMembers().then(function (members) {
                return self.api.reorderMembers(members);
            }).then(function (orderedMembers) {
                self.members = orderedMembers;
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loaders.init = true;
            });
        };

        self.updateMemberDescription = function (member) {
            if (member.description === undefined) {
                self.api.fetchMemberDescription(member).then(function (result) {
                    member.description = result;
                }).catch(function () {
                    member.description = "";
                });
            }
        };

        self.onSwapMembers = function (fromMember, toMember) {

            var from = angular.copy(fromMember);
            var to = angular.copy(toMember);

            // we do it by hand first so the ui is refreshed immediately
            var fromPos = fromMember.position;
            var toPos = toMember.position;
            fromMember.position = toPos;
            toMember.position = fromPos;
            self.members = _.sortBy(self.members, "position");

            self.sortableMembersOpts.disabled = true;
            return self.api.swapMembers(from, to).then(function () {
                return self.api.reorderMembers(self.members);
            }).then(function (orderedMembers) {
                self.members = orderedMembers;
            }).catch(function (err) {
                // revert changes
                fromMember.position = fromPos;
                toMember.position = toPos;
                self.members = _.sortBy(self.members, "position");
                return new ToastError(err);
            }).finally(function () {
                self.sortableMembersOpts.disabled = false;
            });
        };

        self.onMoveMember = function (ev, ui) {
            var targetPosition = ui.item.attr("data-position");
            var movedMember = self.members[targetPosition];
            var swappedMember = self.membersBeforeDrag[targetPosition];

            // check if position changed ? (not dropped at the same place)
            if (movedMember.agentId === swappedMember.agentId) {
                return;
            }

            self.onSwapMembers(movedMember, swappedMember);
        };

        self.startMemberEdition = function (member) {
            self.memberInEdition = angular.copy(member);
            self.memberInEdition.timeout = member.timeout ? member.timeout : 1;
        };

        self.cancelMemberEdition = function () {
            self.memberInEdition = null;
        };

        self.submitMemberChanges = function () {
            self.loaders.editing = true;
            var attrs = ["status", "timeout", "wrapUpTime", "simultaneousLines"];
            return self.api.updateMember(self.memberInEdition).then(function () {
                Toast.success($translate.instant("telephony_alias_members_change_success"));
                var toUpdate = _.find(self.members, { agentId: self.memberInEdition.agentId });
                _.assign(toUpdate, _.pick(self.memberInEdition, attrs));
                self.cancelMemberEdition();
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loaders.editing = false;
            });
        };

        self.deleteMember = function (toDelete) {
            self.loaders.deleting = true;
            self.api.deleteMember(self.memberToDelete).then(function () {
                self.memberToDelete = null;
                Toast.success($translate.instant("telephony_alias_members_delete_success"));
                _.remove(self.members, function (m) {
                    return m.agentId === toDelete.agentId;
                });
                return self.api.reorderMembers(self.members);
            }).then(function (orderedMembers) {
                self.members = orderedMembers;
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loaders.deleting = false;
            });
        };
    }
});

