(function () {
  // ovh-font-phone
  // ovh-font-phoneAlt
  angular.module('managerApp').constant('TELEPHONY_LINE_PHONE_ADDITIONAL_INFOS', {
    'phone.gigaset.c530ip': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/gigaset_c530ip/c530ip-main.jpg',
      icon: 'ovh-font-phone',
    },
    'phone.gigaset.de900ip': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/2015/phones/DE900.png',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.gigaset.de410ip': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/gigaset_de410/de410-main.jpg',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.linksys.pap2t': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/cisco_spa112/spa112-main.jpg',
      icon: 'ovh-font-puzzle',
    },
    'phone.siemens.c610ip': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/2015/phones/C530IP.png',
      icon: 'ovh-font-phone',
    },
    'phone.polycom.ip5000': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/polycom_ip5000/ip5000-main.jpg',
      icon: 'ovh-font-speaker',
    },
    'phone.unidata.wpu7800': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/wpu7800-sub.jpg',
      icon: 'ovh-font-wifi',
    },
    'phone.incom.icw1000g': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/icw1000g-sub.jpg',
      icon: 'ovh-font-wifi',
    },
    'phone.lg.8815': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/2015/phones/LG-88XX.png',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.lg.8820': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/lg_gamme_ip88xx/8820.png',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.lg.8830': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/lg_gamme_ip88xx/8830.png',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.lg.8840': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/lg_gamme_ip88xx/8840.png',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.thomson.tb30': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/tb30-sub.jpg',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.joher.vopstandard': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/index/panel_popc.jpg',
      icon: 'ovh-font-headset',
    },
    'phone.yealink.t46g': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/pack_yealink_t46g_ehs_dongle/t46g-packed-ehs36-bt40-main.jpg',
      additionalConfiguration: {
        UserInterface: {
          screens: 3,
          keysPerScreen: 9,
        },
        ExtensionKeyModule: {
          pagesPerModule: 2,
          keysPerPage: 20,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.yealink.t41p': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/yealink_t41p/t41p-main.jpg',
      additionalConfiguration: {
        UserInterface: {
          screens: 3,
          keysPerScreen: 5,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.cisco.spa508g': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/2015/phones/SPA-5XX.png',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 8,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.cisco.spa504g': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/2015/phones/SPA-5XX.png',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 4,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.cisco.spa112': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/cisco_spa112/spa112-main.jpg',
      icon: 'ovh-font-phoneAlt',
    },
    'phone.cisco.spa525g': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/2015/phones/SPA-5XX.png',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 5,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.cisco.cp8851': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/cisco_CP8851/CP8851-main.jpg',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 10,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.yealink.cp860': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/yealink_CP860/CP860-main.jpg',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 1,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.yealink.w56p': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/yealink_W56P/W56P-main.jpg',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 1,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
    'phone.cisco.cp7841': {
      img: 'https://www.ovhtelecom.fr/images/telephonie/cisco_CP7841/CP7841-main.jpg',
      additionalConfiguration: {
        UserInterface: {
          screens: 1,
          keysPerScreen: 4,
        },
      },
      icon: 'ovh-font-phoneAlt',
    },
  }).constant('TELEPHONY_LINE_PHONE_ACCESSORIES', {
    'cisco.linksys.alim': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/poe.jpg',
    },
    'cisco.spa500s': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/module_cisco.jpg',
    },
    'devolo.avsmartduo': {
      url: 'https://www.ovhtelecom.fr/telephonie/accessoires/cpl_fiche_technique.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories//cpl-sub.jpg',
    },
    'gigaset.c530h': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/siemens_c610ip/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/c530h.jpg',
    },
    'lg.alim': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/lg_gamme_ip88xx/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/poe.jpg',
    },
    'lg.dss12': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/lg_gamme_ip88xx/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/module_led_lg.jpg',
    },
    'lg.dss12l': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/lg_gamme_ip88xx/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/module_lcd_lg.jpg',
    },
    'polycom.ip5000.alim': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/polycom_ip5000/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/poe.jpg',
    },
    'sennheiser.ccel191': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/siemens_c610ip/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/jack.jpg',
    },
    'sennheiser.cstd01': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/thomson_st2030/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/rj9.jpg',
    },
    'sennheiser.cstd01tb30': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/thomson_tb30/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/rj9.jpg',
    },
    'sennheiser.dwofficephone': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sennheiser.dwofficephone.jpg',
    },
    'sennheiser.dwpro2phone': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sennheiser.dwpro2phone.jpg',
    },
    'sennheiser.ehsdhsg': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sennheiser.ehsdhsg.jpg',
    },
    'sennheiser.hsl10': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sennheiser.hsl10.jpg',
    },
    'sennheiser.sc232': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sennheiserSC232.jpg',
    },
    'sennheiser.sc262': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/cisco_serie_spa5/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sennheiser.sc262.jpg',
    },
    'siemens.repeater': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/siemens_c610ip/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/siemensRepeater.jpg',
    },
    'snom.m9c': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/snom_m9/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/m9.jpg',
    },
    'siemens.sl610hpro': {
      url: 'https://www.ovhtelecom.fr/telephonie/telephones/gigaset_de900/accessoires.xml',
      img: 'https://www.ovhtelecom.fr/images/telephonie/accessories/sl610hpro.jpg',
    },
  });
}());
