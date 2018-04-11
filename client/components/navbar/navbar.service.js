class ManagerNavbarService {
    constructor ($q, $translate, $translatePartialLoader, LANGUAGES, MANAGER_URLS, REDIRECT_URLS, TARGET, URLS, OvhApiMe, OtrsPopupService, ssoAuthentication, PackMediator, telecomVoip,
                 voipService, SmsMediator, OvhApiFreeFax, OvhApiOverTheBox, TelecomMediator) {
        this.$q = $q;
        this.$translate = $translate;
        this.$translatePartialLoader = $translatePartialLoader;
        this.LANGUAGES = LANGUAGES;
        this.MANAGER_URLS = MANAGER_URLS;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.TARGET = TARGET;
        this.URLS = URLS;
        this.ovhApiMe = OvhApiMe;
        this.otrsPopupService = OtrsPopupService;
        this.ssoAuthentication = ssoAuthentication;
        this.packMediator = PackMediator;
        this.telecomVoip = telecomVoip;
        this.voipService = voipService;
        this.smsMediator = SmsMediator;
        this.ovhApiFreeFax = OvhApiFreeFax;
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
            )
            .catch(() => this.$q.when(undefined));
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
            )
            .catch(() => this.$q.when(undefined));
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
            )
            .catch(() => this.$q.when(undefined));
    }

    getFaxProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.ovhApiFreeFax.v6()
            .query().$promise
            .then((faxList) => _.sortBy(faxList, "number"))
            .then((result) =>
                _.map(result, (item) => ({
                    name: item,
                    title: item,
                    state: "telecom.freefax",
                    stateParams: {
                        serviceName: item
                    }
                }))
            )
            .catch(() => this.$q.when(undefined));
    }

    getOtbProducts (count) {
        if (count < 0) {
            return this.$q.when(undefined);
        }

        return this.ovhApiOverTheBox.v6()
            .query().$promise
            .then((serviceNames) => {
                let requests = _.map(serviceNames, (serviceName) =>
                    this.ovhApiOverTheBox.v6().get({
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
            )
            .catch(() => this.$q.when(undefined));
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
            }))
            .catch(() => this.$q.when(undefined));
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
            url: this.REDIRECT_URLS.listTicket
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
            "class": "oui-navbar-menu_language",
            title: _(currentLanguage).get("key").replace("_", "-"),
            headerTitle: this.$translate.instant("common_menu_language"),
            subLinks: _.map(this.LANGUAGES.available, (lang) => ({
                title: lang.name,
                isActive: lang.key === currentLanguage.key,
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
                // My Account
                {
                    name: "user.account",
                    title: this.$translate.instant("common_menu_account"),
                    url: this.REDIRECT_URLS.userInfos,
                    subLinks: [{
                        title: this.$translate.instant("common_menu_account_infos"),
                        url: this.REDIRECT_URLS.userInfos
                    }, {
                        title: this.$translate.instant("common_menu_account_security"),
                        url: this.REDIRECT_URLS.userSecurity
                    }, (this.TARGET === "EU" || this.TARGET === "CA") && {
                        title: this.$translate.instant("common_menu_account_emails"),
                        url: this.REDIRECT_URLS.userEmails
                    }, (this.TARGET === "EU") && {
                        title: this.$translate.instant("common_menu_account_subscriptions"),
                        url: this.REDIRECT_URLS.userSubscriptions
                    }, {
                        title: this.$translate.instant("common_menu_account_ssh"),
                        url: this.REDIRECT_URLS.userSSH
                    }, {
                        title: this.$translate.instant("common_menu_account_advanced"),
                        url: this.REDIRECT_URLS.userAdvanced
                    }]
                },

                // Billing
                !currentUser.isEnterprise && {
                    name: "user.billing",
                    title: this.$translate.instant("common_menu_billing"),
                    url: this.REDIRECT_URLS.billing,
                    subLinks: [{
                        title: this.$translate.instant("common_menu_billing_history"),
                        url: this.REDIRECT_URLS.billing
                    }, {
                        title: this.$translate.instant("common_menu_billing_payments"),
                        url: this.REDIRECT_URLS.billingPayments
                    }]
                },

                // Services
                (this.TARGET === "EU" || this.TARGET === "CA") && (!currentUser.isEnterprise ? {
                    name: "user.services",
                    title: this.$translate.instant("common_menu_renew"),
                    url: this.REDIRECT_URLS.services,
                    subLinks: [{
                        title: this.$translate.instant("common_menu_renew_management"),
                        url: this.REDIRECT_URLS.services
                    }, {
                        title: this.$translate.instant("common_menu_renew_agreements"),
                        url: this.REDIRECT_URLS.servicesAgreements
                    }]
                } : {
                    title: this.$translate.instant("common_menu_renew_agreements"),
                    url: this.REDIRECT_URLS.servicesAgreements
                }),

                // Payment
                !currentUser.isEnterprise && {
                    name: "user.payment",
                    title: this.$translate.instant("common_menu_means"),
                    url: this.REDIRECT_URLS.paymentMeans,
                    subLinks: [{
                        title: this.$translate.instant("common_menu_means_mean"),
                        url: this.REDIRECT_URLS.paymentMeans
                    }, (this.TARGET === "EU" || this.TARGET === "CA") && {
                        title: this.$translate.instant("common_menu_means_ovhaccount"),
                        url: this.REDIRECT_URLS.ovhAccount
                    }, (this.TARGET === "EU" || this.TARGET === "CA") && {
                        title: this.$translate.instant("common_menu_means_vouchers"),
                        url: this.REDIRECT_URLS.billingVouchers
                    }, {
                        title: this.$translate.instant("common_menu_means_refunds"),
                        url: this.REDIRECT_URLS.billingRefunds
                    }, (this.TARGET === "EU") && {
                        title: this.$translate.instant("common_menu_means_fidelity"),
                        url: this.REDIRECT_URLS.billingFidelity
                    }, {
                        title: this.$translate.instant("common_menu_means_credits"),
                        url: this.REDIRECT_URLS.billingCredits
                    }]
                },

                // Orders
                (!currentUser.isEnterprise && this.TARGET === "EU" && currentUser.ovhSubsidiary === "FR") && {
                    title: this.$translate.instant("common_menu_orders_all"),
                    url: this.REDIRECT_URLS.orders
                },

                // Contacts
                (this.TARGET === "EU") && {
                    title: this.$translate.instant("common_menu_contacts"),
                    url: this.REDIRECT_URLS.contacts
                },

                // Tickets
                {
                    title: this.$translate.instant("common_menu_list_ticket"),
                    url: this.REDIRECT_URLS.listTicket
                },

                // Logout
                {
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

    loadTranslations () {
        this.$translatePartialLoader.addPart("common");
        this.$translatePartialLoader.addPart("components");
        return this.$translate.refresh();
    }

    // Get managers links for main-links attribute
    getManagerLinks (products) {
        const currentUniverse = "telecom";
        const managerUrls = this.MANAGER_URLS;
        const managerNames = [
            "portal", "web", "dedicated", "cloud", "telecom", "gamma", "partners", "labs"
        ];

        return _.map(managerNames, (managerName) => {
            const managerLink = {
                name: managerName,
                "class": managerName,
                title: this.$translate.instant(`common_menu_${managerName}`),
                url: managerUrls[managerName],
                isPrimary: ["partners", "labs"].indexOf(managerName) === -1
            };

            if (products && managerName === currentUniverse) {
                managerLink.subLinks = this.getUniverseMenu(products);
            }

            return managerLink;
        });
    }

    // Get products and build responsive menu
    getResponsiveLinks () {
        return this.getProducts()
            .then((products) => this.getManagerLinks(products))
            .catch(() => this.getManagerLinks());
    }

    // Get navbar navigation and user infos
    getNavbar () {
        const managerUrls = this.MANAGER_URLS;

        // Get base structure for the navbar
        const getBaseNavbar = (user) => {
            const baseNavbar = {
                // Set OVH Logo
                brand: {
                    title: this.$translate.instant("common_menu_telecom"),
                    url: managerUrls.telecom,
                    iconAlt: "OVH",
                    iconClass: "navbar-logo",
                    iconSrc: "assets/images/navbar/icon-logo-ovh.svg"
                },

                // Set Manager Links
                managerLinks: this.getManagerLinks()
            };

            // Set Internal Links
            if (user) {
                baseNavbar.internalLinks = [
                    this.getAssistanceMenu(user), // Assistance
                    this.getLanguageMenu(), // Language
                    this.getUserMenu(user) // User
                ];
            }

            return baseNavbar;
        };

        return this.$q.all({
            translate: this.loadTranslations(),
            user: this.ovhApiMe.v6().get().$promise
        })
            .then(({ user }) => getBaseNavbar(user))
            .catch(() => getBaseNavbar());
    }
}

angular.module("managerApp")
    .service("ManagerNavbarService", ManagerNavbarService);
