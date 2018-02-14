class ManagerNavbarService {
    constructor ($q, $translate, LANGUAGES, MANAGER_URLS, REDIRECT_URLS, URLS, OvhApiMe, OtrsPopupService, ssoAuthentication, PackMediator, telecomVoip, voipService, SmsMediator, OvhApiTelephonyFax, OvhApiOverTheBox, TelecomMediator) {
        this.$q = $q;
        this.$translate = $translate;
        this.LANGUAGES = LANGUAGES;
        this.MANAGER_URLS = MANAGER_URLS;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.URLS = URLS;
        this.ovhApiMe = OvhApiMe;
        this.otrsPopupService = OtrsPopupService;
        this.ssoAuthentication = ssoAuthentication;
        this.packMediator = PackMediator;
        this.telecomVoip = telecomVoip;
        this.voipService = voipService;
        this.smsMediator = SmsMediator;
        this.ovhApiTelephonyFax = OvhApiTelephonyFax;
        this.ovhApiOverTheBox = OvhApiOverTheBox;
        this.telecomMediator = TelecomMediator;
    }

    getPackGroup (pack) {
        const packGroup = [];
        const addGroup = (group, name, title) => {
            packGroup.push({
                name,
                title,
                subLinks: _.map(group, (xdsl) => ({
                    title: xdsl.description || xdsl.accessName,
                    state: "telecom.pack.xdsl",
                    stateParams: {
                        packName: pack.packName,
                        serviceName: xdsl.accessName,
                        number: xdsl.line.number
                    }
                }))
            });
        };

        // Dashboard
        packGroup.push({
            title: this.$translate.instant("telecom_sidebar_informations"),
            state: "telecom.pack",
            stateParams: {
                packName: pack.packName
            }
        });

        // xDSL Groups
        ["sdsl", "adsl", "vdsl"].forEach((accessType) => {
            const xdslGroup = _.filter(pack.xdsl, { accessType });
            if (xdslGroup.length) {
                addGroup(
                    xdslGroup,
                    `${pack.packName}.${accessType}`,
                    _.capitalize(accessType)
                );
            }
        });

        return packGroup;
    }

    getPackProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.packMediator
            .fetchPacks()
            .then((result) =>
                _.map(result, (item) => {
                    const itemLink = {
                        name: item.packName,
                        title: item.description || item.offerDescription || item.packName
                    };

                    if (item.xdsl.length) {
                        // Get subLinks for submenu
                        itemLink.subLinks = this.getPackGroup(item);
                    } else {
                        // Or create a link
                        itemLink.state = "telecom.pack";
                        itemLink.stateParams = {
                            packName: item.packName
                        };
                    }

                    return itemLink;
                })
            );
    }

    getTelephonyGroup (telephony) {
        const telephonyGroup = [];
        const addGroup = (group, name, title, state) => {
            telephonyGroup.push({
                name,
                title,
                subLinks: _.map(group, (service) => ({
                    title: service.getDisplayedName(),
                    state,
                    stateParams: {
                        billingAccount: service.billingAccount,
                        serviceName: service.serviceName
                    }
                }))
            });
        };

        // Dashboard
        telephonyGroup.push({
            title: this.$translate.instant("telecom_sidebar_dashboard"),
            state: "telecom.telephony",
            stateParams: {
                billingAccount: telephony.billingAccount
            }
        });

        // Alias
        const alias = telephony.getAlias();
        const sortedAlias = this.voipService.sortServicesByDisplayedName(alias);
        if (sortedAlias.length) {
            addGroup(
                sortedAlias,
                `${telephony.billingAccount}.alias`,
                this.$translate.instant("telecom_sidebar_section_telephony_number"),
                "telecom.telephony.alias"
            );
        }

        // Lines
        const lines = telephony.getLines();
        const sortedLines = this.voipService.sortServicesByDisplayedName(lines);
        if (sortedLines.length) {
            // Lines
            const sortedSipLines = _.filter(sortedLines, (line) => ["plugAndFax", "fax", "voicefax"].indexOf(line.featureType) === -1);
            if (sortedSipLines.length) {
                addGroup(
                    sortedSipLines,
                    `${telephony.billingAccount}.line`,
                    this.$translate.instant("telecom_sidebar_section_telephony_line"),
                    "telecom.telephony.line"
                );
            }

            // PlugAndFax
            const sortedPlugAndFaxLines = this.voipService.filterPlugAndFaxServices(sortedLines);
            if (sortedPlugAndFaxLines.length) {
                addGroup(
                    sortedPlugAndFaxLines,
                    `${telephony.billingAccount}.plugAndFax`,
                    this.$translate.instant("telecom_sidebar_section_telephony_plug_fax"),
                    "telecom.telephony.line"
                );
            }

            // Fax
            const sortedFaxLines = this.voipService.filterFaxServices(sortedLines);
            if (sortedFaxLines.length) {
                addGroup(
                    sortedFaxLines,
                    `${telephony.billingAccount}.fax`,
                    this.$translate.instant("telecom_sidebar_section_telephony_fax"),
                    "telecom.telephony.fax"
                );
            }
        }

        return telephonyGroup;
    }

    getTelephonyProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.telecomVoip
            .fetchAll()
            .then((result) =>
                _.map(result, (item) => {
                    const itemLink = {
                        name: item.billingAccount,
                        title: item.getDisplayedName()
                    };

                    if (item.services.length) {
                        // Get subLinks for submenu
                        itemLink.subLinks = this.getTelephonyGroup(item);
                    } else {
                        // Or create a link
                        itemLink.state = "telecom.telephony";
                        itemLink.stateParams = {
                            billingAccount: item.billingAccount
                        };
                    }

                    return itemLink;
                })
            );
    }

    getSmsProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.smsMediator
            .initAll()
            .then((result) =>
                _.map(result, (item) => ({
                    name: item.name,
                    title: item.description || item.name,
                    state: "telecom.sms.dashboard",
                    stateParams: {
                        serviceName: item.name
                    }
                }))
            );
    }

    getFaxProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.ovhApiTelephonyFax.Aapi()
            .getServices().$promise
            .then((faxList) => _.filter(faxList, {
                type: "FREEFAX"
            }))
            .then((result) =>
                _.map(result, (item) => ({
                    name: item.serviceName,
                    title: item.label,
                    state: "telecom.freefax",
                    stateParams: {
                        serviceName: item.serviceName
                    }
                }))
            ).catch(() => this.$q.when(undefined));
    }

    getOtbProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.ovhApiOverTheBox.Lexi()
            .query().$promise
            .then((serviceNames) => {
                let requests = _.map(serviceNames, (serviceName) =>
                    this.ovhApiOverTheBox.Lexi().get({
                        serviceName: serviceName
                    }).$promise);

                return this.$q.all(requests);
            })
            .then((result) =>
                _.map(result, (item) => ({
                    name: item.serviceName,
                    title: item.customerDescription || item.serviceName,
                    state: "telecom.overTheBox.details",
                    stateParams: {
                        serviceName: item.serviceName
                    }
                }))
            );
    }

    getProducts () {
        return this.telecomMediator
            .initServiceCount()
            .then((count) => this.$q.all({
                pack: this.getPackProducts(count.pack),
                telephony: this.getTelephonyProducts(count.telephony),
                sms: this.getSmsProducts(count.sms),
                freefax: this.getFaxProducts(count.freefax),
                overTheBox: this.getOtbProducts(count.overTheBox)
            }));
    }

    getUniverseMenu (products) {
        return [{
            name: "managerv4",
            title: this.$translate.instant("telecom_sidebar_section_v4"),
            url: this.REDIRECT_URLS.telephonyV4
        }, {
            name: "pack",
            title: this.$translate.instant("telecom_sidebar_section_pack"),
            subLinks: products.pack
        }, {
            name: "telephony",
            title: this.$translate.instant("telecom_sidebar_section_telephony"),
            subLinks: products.telephony
        }, {
            name: "sms",
            title: this.$translate.instant("telecom_sidebar_section_sms"),
            subLinks: products.sms
        }, {
            name: "freefax",
            title: this.$translate.instant("telecom_sidebar_section_fax"),
            subLinks: products.freefax
        }, {
            name: "overTheBox",
            title: this.$translate.instant("telecom_sidebar_section_otb"),
            subLinks: products.overTheBox
        }, {
            name: "managerv4",
            title: this.$translate.instant("telecom_sidebar_section_task"),
            state: "telecom.task"
        }];
    }

    getAssistanceMenu () {
        const currentSubsidiaryURLs = this.URLS;
        const assistanceMenu = [];

        // Guides (External)
        if (_(currentSubsidiaryURLs).has("guides.home")) {
            assistanceMenu.push({
                title: this.$translate.instant("common_menu_support_all_guides"),
                url: currentSubsidiaryURLs.guides.home,
                isExternal: true
            });
        }

        // New ticket
        assistanceMenu.push({
            title: this.$translate.instant("common_menu_support_new_ticket"),
            click: (callback) => {
                if (!this.otrsPopupService.isLoaded()) {
                    this.otrsPopupService.init();
                } else {
                    this.otrsPopupService.toggle();
                }

                if (typeof callback === "function") {
                    callback();
                }
            }
        });

        // Tickets list
        assistanceMenu.push({
            title: this.$translate.instant("common_menu_support_list_ticket"),
            url: "#/support"
        });

        // Telephony (External)
        if (_(currentSubsidiaryURLs).has("support_contact")) {
            assistanceMenu.push({
                title: this.$translate.instant("common_menu_support_telephony_contact"),
                url: currentSubsidiaryURLs.support_contact,
                isExternal: true
            });
        }

        return {
            name: "assistance",
            title: this.$translate.instant("common_menu_support_assistance"),
            iconClass: "icon-assistance",
            subLinks: assistanceMenu
        };
    }

    getLanguageMenu () {
        const currentLanguage = _.find(this.LANGUAGES.available, (val) => val.key === localStorage["univers-selected-language"]);

        return {
            name: "languages",
            label: _(currentLanguage).get("name"),
            title: _(currentLanguage).get("key").replace("_", "-"),
            subLinks: _.map(this.LANGUAGES.available, (lang) => ({
                title: lang.name,
                click: function () {
                    localStorage["univers-selected-language"] = lang.key;
                    window.location.reload();
                },
                lang: _.chain(lang.key).words().head().value()
            }))
        };
    }

    getUserMenu (currentUser) {
        return {
            name: "user",
            title: currentUser.firstname,
            iconClass: "icon-user",
            nichandle: currentUser.nichandle,
            fullName: `${currentUser.firstname} ${currentUser.name}`,
            subLinks: [
                {
                    title: this.$translate.instant("common_menu_account"),
                    url: this.REDIRECT_URLS.userInfos
                }, {
                    title: this.$translate.instant("common_menu_billing"),
                    url: this.REDIRECT_URLS.billing
                }, {
                    title: this.$translate.instant("common_menu_renew"),
                    url: this.REDIRECT_URLS.services
                }, {
                    title: this.$translate.instant("common_menu_orders_all"),
                    url: this.REDIRECT_URLS.orders
                }, {
                    title: this.$translate.instant("common_menu_contacts"),
                    url: this.REDIRECT_URLS.contacts
                }, {
                    title: this.$translate.instant("common_menu_list_ticket"),
                    url: this.REDIRECT_URLS.listTicket
                }, {
                    title: this.$translate.instant("global_logout"),
                    "class": "logout",
                    click: (callback) => {
                        this.ssoAuthentication.logout();

                        if (typeof callback === "function") {
                            callback();
                        }
                    }
                }
            ]
        };
    }

    // Get navbar navigation and user infos
    getNavbar () {
        const currentUniverse = "telecom";
        const managerUrls = this.MANAGER_URLS;
        const managerNames = [
            "portal", "web", "dedicated", "cloud", "telecom", "gamma", "partners", "labs"
        ];

        return this.$q.all({
            products: this.getProducts(),
            user: this.ovhApiMe.Lexi().get().$promise
        }).then((result) => ({
            brand: {
                title: this.$translate.instant("common_menu_portal"),
                url: managerUrls.portal,
                iconAlt: "OVH",
                iconClass: "navbar-logo",
                iconSrc: "assets/images/navbar/icon-logo-ovh.svg"
            },

            // Set Internal Links
            internalLinks: [
                this.getAssistanceMenu(result.user),    // Assistance
                this.getLanguageMenu(),                 // Language
                this.getUserMenu(result.user)           // User
            ],

            // Set Manager Links
            managerLinks: _.map(managerNames, (managerName) => {
                const managerLink = {
                    name: managerName,
                    "class": managerName,
                    title: this.$translate.instant(`common_menu_${managerName}`),
                    url: managerUrls[managerName],
                    isPrimary: ["partners", "labs"].indexOf(managerName) === -1
                };

                if (managerName === currentUniverse) {
                    managerLink.subLinks = this.getUniverseMenu(result.products);
                }

                return managerLink;
            })
        }));
    }
}

angular.module("managerApp")
    .service("ManagerNavbarService", ManagerNavbarService);
