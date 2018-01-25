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
      "id": "managerApp.object:VoipFeature",
      "shortName": "VoipFeature",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Factory that describes a voip feature (e.g. sip, mgcp, contactCenterSolution, ...). This is a base for VoipLineFeature factory and future VoipAliasFeature factory.",
      "keywords": "account base billing billingaccount contactcentersolution creating describes directly factory feature featuretype future instance instanciated linked managerapp mgcp object options service servicename shared sip type voip voipaliasfeature voipfeature voiplinefeature"
    },
    {
      "section": "voip",
      "id": "managerApp.object:VoipLine",
      "shortName": "VoipLine",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Inherits from VoipLineFeature.",
      "keywords": "api attributes availables called creating default describes enum feature https inherited instance managerapp method object options ovh properties required returned set setoptions setted specific telephony voip voipline voiplinefeature"
    },
    {
      "section": "voip",
      "id": "managerApp.object:VoipLineFeature",
      "shortName": "VoipLineFeature",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Inherits from VoipFeature.",
      "keywords": "apis attributes creating describes enums fax feature instance managerapp method notifications object options representing required returned setoptions setted shared telephony voip voipfeature voiplinefeature"
    },
    {
      "section": "voip",
      "id": "managerApp.object:VoipService",
      "shortName": "VoipService",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Factory that describes a service with attributes returned by /telephony/&#123;billingAccount&#125;/service/&#123;serviceName&#125; API.",
      "keywords": "api attributes availables billingaccount check creating describes description displayed displayedname enum getdisplayedname helper https instance isdescriptionsameasservicename managerapp mandatory method note object options ovh properties provided required returned service servicename telephony telephonyservice true voip voipservice"
    },
    {
      "section": "voip",
      "id": "managerApp.object:VoipServiceAlias",
      "shortName": "VoipServiceAlias",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Inherits from VoipService.",
      "keywords": "alias api attributes availables creating describes instance managerapp object options properties required returned service voip voipservice voipservicealias"
    },
    {
      "section": "voip",
      "id": "managerApp.object:VoipServiceLine",
      "shortName": "VoipServiceLine",
      "type": "object",
      "moduleName": "managerApp",
      "shortDescription": "Inherits from VoipService.",
      "keywords": "api availables check creating describe describes doesn factory feature getrealfeaturetype helper instance issiptrunk lines managerapp method object offer options properties real required return service sip true trunk type voip voipservice voipserviceline"
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
      "id": "managerApp.service:voipFax",
      "shortName": "voipFax",
      "type": "service",
      "moduleName": "managerApp",
      "shortDescription": "Describe a service that manage fax and freefax feature types.",
      "keywords": "api apis call calls fax feature fetchfeature freefax https instance manage managerapp method object options ovh ovh-api-services ovhapitelephony return save saved savefeature service telephony types voip voiplinefeature voipservice"
    },
    {
      "section": "voip",
      "id": "managerApp.service:voipLine",
      "shortName": "voipLine",
      "type": "service",
      "moduleName": "managerApp",
      "shortDescription": "Describe a service that manage sip, mgcp, plugAndFax, ... feature types (all featureTypes that are not fax and freefax for line services).",
      "keywords": "api apis call calls fax feature featuretypes fetchfeature freefax https instance manage managerapp method mgcp object options ovh ovh-api-services ovhapitelephony plugandfax return save saved savefeature service services sip telephony types voip voipline voipservice"
    },
    {
      "section": "voip",
      "id": "managerApp.service:voipLineFeature",
      "shortName": "voipLineFeature",
      "type": "service",
      "moduleName": "managerApp",
      "shortDescription": "Service that manage features of services with serviceType line. This is not the line feature that is managed (the line service type either) !!!",
      "keywords": "api call calls check considered determine fax feature features featuretype fetch fetchfeature good instance isfax letting manage managed managerapp managing method options ovh-api-services ovhapitelephony return routes save saved savefeature service services servicetype sub-service true type voip voipfax voipfeature voipline voipservice"
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
  "html5Mode": false,
  "editExample": true,
  "startPage": "voip/managerApp",
  "scripts": [
    "angular.min.js"
  ]
};