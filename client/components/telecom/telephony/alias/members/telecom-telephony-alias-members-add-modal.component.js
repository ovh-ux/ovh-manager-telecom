angular.module("managerApp").controller("telecomTelephonyAliasMembersAddModal", class telecomTelephonyAliasMembersAddModal {
    constructor ($timeout, $uibModalInstance) {
        this.$uibModalInstance = $uibModalInstance;
        this.$timeout = $timeout;
    }

    cancel (message) {
        return this.$uibModalInstance.dismiss(message);
    }

    close () {
        return this.$uibModalInstance.close(true);
    }
});
