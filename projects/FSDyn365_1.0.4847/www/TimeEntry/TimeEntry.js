/// <reference path="../JSBridge.js" />
/// <reference path="../Schema.js" />
/// <reference path="../Enums.js" />
/// <reference path="../Common.js" />

var FS = FS || {};

FS.TimeEntry = {

    timeEntryOnLoad: function () {
        MobileCRM.UI.EntityForm.onChange(FS.TimeEntry.handleChange, true, null);
        FS.TimeEntry.setEntityFormFieldsOnLoad();
    },

    setEntityFormFieldsOnLoad: function () {
        MobileCRM.Configuration.requestObject(function (config) {
            if (config && config.settings) {
                var systemUserId = config.settings.systemUserId;
                // Get the Bookable Resource with the system user.
                var fetchResource = new MobileCRM.FetchXml.Fetch(FS.TimeEntry.getBookableResourceFetchQuery(systemUserId));
                fetchResource.execute("Array", function (results) {
                    if (results && results.length > 0) {
                        var referBookableResource = new MobileCRM.Reference(FS.Schema.BookableResource.name, results[0][0], results[0][1]);
                        //Get the Time Entry Setting record of type Field Service
                        var fetchTimeEntry = new MobileCRM.FetchXml.Fetch(FS.TimeEntry.getTimeEntrySettingFetchQuery());
                        fetchTimeEntry.execute("Array", function (TERecord) {
                            if (TERecord && TERecord.length > 0) {
                                var referTimeEntrySetting = new MobileCRM.Reference(FS.Schema.TimeEntrySetting.name, TERecord[0][0]);
                                MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
                                if (entityForm && entityForm.entity && entityForm.entity.isNew) {
                                    entityForm.entity.properties[FS.Schema.TimeEntry.properties.bookableResource] = referBookableResource;
                                    entityForm.entity.properties[FS.Schema.TimeEntry.properties.timeEntrySetting] = referTimeEntrySetting;
                                }
                            }, MobileCRM.bridge.alert);
                        }
                        }, MobileCRM.bridge.alert);
                    }
                }, MobileCRM.bridge.alert);
            }
        }, MobileCRM.bridge.alert);
    },

    getBookableResourceFetchQuery: function(systemUserId) {
        var bookableResource = new MobileCRM.FetchXml.Entity(FS.Schema.BookableResource.name);
        bookableResource.addAttribute(FS.Schema.BookableResource.properties.bookableResourceId);
        bookableResource.addAttribute(FS.Schema.BookableResource.properties.name);
        bookableResource.filter = new MobileCRM.FetchXml.Filter();
        bookableResource.filter.where(FS.Schema.BookableResource.properties.userId, "eq", systemUserId); // default field service setting record id
        return bookableResource;
    },

    getTimeEntrySettingFetchQuery: function () {
        var fetchTimeEntrySettingRecord = new MobileCRM.FetchXml.Entity(FS.Schema.TimeEntrySetting.name);
        fetchTimeEntrySettingRecord.filter = new MobileCRM.FetchXml.Filter();
        fetchTimeEntrySettingRecord.addAttribute(FS.Schema.TimeEntrySetting.properties.msdyn_timeEntrySettingid);
        fetchTimeEntrySettingRecord.filter.where(FS.Schema.TimeEntrySetting.properties.msdyn_sourceType, "eq", FS.Enums.TimeEntrySetting_SourceType.FieldService);
        fetchTimeEntrySettingRecord.orderBy(FS.Schema.TimeEntrySetting.properties.createdOn, "true");
        return fetchTimeEntrySettingRecord;
    },

    handleChange: function (entityForm) {
        var changedItem = entityForm && entityForm.context && entityForm.context.changedItem;
        var editedEntity = entityForm && entityForm.entity;
        if (changedItem && editedEntity && editedEntity.properties) {
            switch (changedItem) {
                case FS.Schema.TimeEntry.properties.startTime:
                case FS.Schema.TimeEntry.properties.endTime:
                    FS.TimeEntry.updateDuration(editedEntity);
                    break;
                case FS.Schema.TimeEntry.properties.duration:
                    FS.TimeEntry.updateEndTime(editedEntity);
                    break;
                default:
                    break;
            }
        }
    },

    updateDuration: function (editedEntity) {
        if (!!editedEntity.properties[FS.Schema.TimeEntry.properties.startTime] &&
            !!editedEntity.properties[FS.Schema.TimeEntry.properties.endTime]) {
            var startDate = editedEntity.properties[FS.Schema.TimeEntry.properties.startTime].setSeconds(0, 0);
            var endDate = editedEntity.properties[FS.Schema.TimeEntry.properties.endTime].setSeconds(0, 0);
            var subtractResult = Math.floor((endDate - startDate) / (1000 * 60)); // Convert to minutes

            editedEntity.properties[FS.Schema.TimeEntry.properties.duration] = subtractResult < 0 ? 0 : subtractResult;
        }
    },

    updateEndTime: function (editedEntity) {
        if (!!editedEntity.properties[FS.Schema.TimeEntry.properties.duration] &&
            !!editedEntity.properties[FS.Schema.TimeEntry.properties.startTime]) {
            var startDate = editedEntity.properties[FS.Schema.TimeEntry.properties.startTime].setSeconds(0, 0);
            var duration = editedEntity.properties[FS.Schema.TimeEntry.properties.duration] * (1000 * 60); //convert to milliseconds
            var endDate = startDate + duration; // Convert to minutes

            editedEntity.properties[FS.Schema.TimeEntry.properties.endTime] = new Date(endDate);
        }
    }
}