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
  },
};

export default {
  TUC_TELEPHONY_ALIAS,
};
