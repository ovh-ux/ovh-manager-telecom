angular.module('managerApp').service('Phonebookcontact', function (TELEPHONY_PHONEBOOK) {
  const self = this;

  self.getContactData = function (contact) {
    if (!contact) {
      return null;
    }
    return {
      group: _.isEmpty(contact.group) ? _.get(TELEPHONY_PHONEBOOK, 'emptyFields.group') : contact.group,
      name: contact.name,
      surname: contact.surname,
      homeMobile: _.isNull(contact.homeMobile) ? '' : contact.homeMobile,
      homePhone: _.isNull(contact.homePhone) ? '' : contact.homePhone,
      workMobile: _.isNull(contact.workMobile) ? '' : contact.workMobile,
      workPhone: _.isNull(contact.workPhone) ? '' : contact.workPhone,
    };
  };

  self.hasAtLeastOnePhoneNumber = function (contact) {
    if (!contact) {
      return null;
    }
    return _.some(TELEPHONY_PHONEBOOK.numberFields, field => !_.isEmpty(_.get(contact, field)));
  };
});
