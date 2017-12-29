NG_DOCS={
  "sections": {
    "voip": "Telephony API"
  },
  "pages": [
    {
      "section": "voip",
      "id": "managerApp",
      "shortName": "managerApp",
      "type": "overview",
      "moduleName": "managerApp",
      "shortDescription": "OVH Control Panel Telecom UI",
      "keywords": "angular api calls control documentation documented good help improve manager managerapp moment overview ovh panel services telecom telephony ui voip writing"
    },
    {
      "section": "voip",
      "id": "managerApp.object:VoipBillingAccount",
      "shortName": "VoipBillingAccount",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Factory that describes a billingAccount with attributes returned by /telephony/&#123;billingAccount&#125; API.",
      "keywords": "account add adding addservice addservices alias api arguments array attached attributes availables bellow billing billingaccount creating custom describes description displayed displayedname enum existing exists getalias getdisplayedname getlines https instance instances list listed managerapp mandatory match method note object objects option options ovh passed populate properties property provided replaced required returned service servicename services servicetype telephony voip voipbillingaccount voipservice"
    },
    {
      "section": "voip",
      "id": "managerApp.service:telecomVoip",
      "shortName": "telecomVoip",
      "type": "service",
      "moduleName": "managerApp",
      "shortDescription": "This service is the beginning of everything :-) This service will allow you to fetch all billingAccounts and their services in one API call. It&#39;s used for example to display sidebar menu.",
      "keywords": "accounts allow api apiv7 associated bad better billing billingaccounts cache call calls code connected display error example factories fetch fetchall filter filters grouped managerapp menu method refreshed removed replace replaced return returns service services sidebar status telecom user voip"
    },
    {
      "section": "voip",
      "id": "managerApp.service:voipBillingAccount",
      "shortName": "voipBillingAccount",
      "type": "service",
      "moduleName": "managerApp",
      "shortDescription": "Service that manage API calls to /telephony/&#123;billingAccount&#125;.",
      "keywords": "api apiv7 array better billingaccounts calls code connected error fetchall filter filters instances manage managerapp method object ovh-api-services ovhapitelephony replaced return service services status user v7 voip voipbillingaccount"
    },
    {
      "section": "voip",
      "id": "managerApp.service:voipService",
      "shortName": "voipService",
      "type": "service",
      "moduleName": "managerApp",
      "shortDescription": "Service that manage API calls to /telephony/&#123;billingAccount&#125;/service/&#123;serviceName&#125;. It will differenciate alias and line service types.",
      "keywords": "alias aliases api apiv7 argument array attached better billingaccount call calls code connected dayinterval days detected devs diagnostic diagnosticreport differenciate displayed error fax featuretype fecthsingleservice fetch fetchall fetchdiagnosticreports fetched fetchservicediagnosticreports filter filteraliasservices filtered filterfaxservices filterlineservices filterplugandfaxservices filters http https informations instance instances leg lines list manage managerapp match method mos net number object objects ovh ovh-api-services ovhapitelephony plugandfax protocol relevant replaced report reports representing return returns ria route service servicename services servicetype signal single sip sort sorted sortservicesbydisplayedname status telephony types unique user v7 voip voipservice"
    }
  ],
  "apis": {
    "voip": true
  },
  "html5Mode": true,
  "editExample": true,
  "startPage": "voip/managerApp",
  "scripts": [
    "angular.min.js"
  ]
};