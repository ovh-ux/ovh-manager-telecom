export const TUC_TELEPHONY_ALIAS = {
  featureTypes: {
    contactCenterSolution: ['contactCenterSolution', 'easyHunting', 'cloudHunting', 'easyPabx', 'miniPabx', 'oldPabx', 'ovhPabx'],
  },
  conference: {
    reportStatus: ['none', 'customer', 'other'],
    languages: [
      { label: 'de_DE', value: 'de' },
      { label: 'en_GB', value: 'en' },
      { label: 'es_ES', value: 'es' },
      { label: 'fr_FR', value: 'fr' },
      { label: 'it_IT', value: 'it' },
    ],
    webAccessType: {
      followUp: 'read',
      control: 'write',
    },
  },
  contactCenterSolution: {
    tariffsGuideUrl: 'https://www.ovhtelecom.fr/telephonie/decouvrez/tarifs_telephonie.xml',
    filtering: {
      listTypes: ['incomingBlackList', 'incomingWhiteList', 'outgoingBlackList', 'outgoingWhiteList'],
      helperPrefixes: [
        { label: 'mobile', prefixes: ['+336', '+337'] },
        { label: 'line', prefixes: ['+331', '+332', '+333', '+334', '+335', '+339'] },
        { label: 'foreign', prefixes: ['+1', '+2', '+30', '+31', '+32', '+34', '+35', '+36', '+37', '+38', '+39', '+4', '+5', '+6', '+7', '+8', '+9'] },
        { label: 'special', prefixes: ['+338'] },
        { label: 'short', prefixes: ['10', '11', '12', '13', '14', '16', '19', '30', '31', '32', '36', '39'] },
      ],
    },
    recordsGuideUrl: 'http://www.ovh.com/fr/support/documents_legaux/conditions_particulieres_du_service_d_enregistrement_des_communications_telephoniques.pdf',
    records: {
      languages: [
        { id: 'french', code: 'fr_FR' },
        { id: 'english', code: 'en_GB' },
      ],
      digits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
  },
  specialNumber: {
    noScheduledRateCode: 'No rate code changes had been scheduled.',
  },
};

export default {
  TUC_TELEPHONY_ALIAS,
};
