angular.module("managerApp").service("voipTimeConditionConfiguration", class voipTimeConditionConfiguration {

    constructor ($http, $q, $timeout, OvhApiMe) {
        this.$http = $http;
        this.$q = $q;
        this.$timeout = $timeout;
        this.OvhApiMe = OvhApiMe;
    }

    exportConfiguration (data) {
        return this.OvhApiMe.v6().get().$promise.then((me) => {
            let fileName = `${me.nichandle}_${moment().format("YYYY_MM_DD_HHmmss_SSS")}.json`;
            let jsonData = JSON.stringify(data);

            let blob = new Blob([jsonData], { type: "application/json" });

            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                let downloadLink = document.createElement("a");
                downloadLink.setAttribute("href", window.URL.createObjectURL(blob));
                downloadLink.setAttribute("download", fileName);
                downloadLink.setAttribute("target", "_blank");
                downloadLink.setAttribute("style", "visibility:hidden");

                document.body.appendChild(downloadLink);
                this.$timeout(() => {
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                });
            }

            return this.$q.when();
        });
    }

    importConfiguration (file) {
        return this.OvhApiMe.Document().v6().upload(file.name, file).then((doc) =>
            this.OvhApiMe.Document().v6().get({
                id: doc.id
            }).$promise.then((newDoc) =>
                this.$http.get(newDoc.getUrl)
                    .success((data) => data)
                    .error((error) => this.$q.reject(error))
            )
        );
    }
});
