function AccountFilter() {
    var productId = null;
    try {

        // Change the parent customer on currently edited contact entity
        MobileCRM.UI.EntityForm.onChange(
			function (entityForm) {
			    if (!entityForm.context.changedItem == "address1_city")
			        return;

			    MobileCRM.UI.EntityForm.requestObject(function (entityForm) {
			        //  MobileCRM.bridge.alert(JSON.stringify(entityForm));
			        /// <param name="entityForm" type="MobileCRM.UI.EntityForm"/>
			        // Take detail view with name "General"
			        var dv = entityForm.getDetailView("General");

			        var inlineSetup = new MobileCRM.UI.DetailViewItems.LookupSetup();

			        var City = entityForm.entity.properties.address1_city;

			      inlineSetup.addView("account", "Default", true);

			        // Alternatively, specify the explicit fetch XML filter for inline lookup 
			        inlineSetup.addFilter("account", '<fetch version="1.0"><entity name="account"><attribute name="name" /><attribute name="primarycontactid" /><attribute name="telephone1" /><attribute name="accountid" /><order attribute="name" descending="false" /><filter type="and"><condition attribute="address1_city" operator="eq" value="' + City + '" /><condition attribute="statecode" operator="eq" value="0" /></filter></entity></fetch>');

			        dialogSetup = new MobileCRM.UI.DetailViewItems.LookupSetup();
			        dialogSetup.addView("account", "Default", true);  // Set "Default" view for expanded lookup form

			        dialogSetup.addFilter("account", '<fetch version="1.0"><entity name="account"><attribute name="name" /><attribute name="primarycontactid" /><attribute name="telephone1" /><attribute name="accountid" /><order attribute="name" descending="false" /><filter type="and"><condition attribute="address1_city" operator="eq" value="' + City + '" /><condition attribute="statecode" operator="eq" value="0" /></filter></entity></fetch>');

			        dialogOnly = false; // Allow both inline lookup and expanded lookup dialog

			        // Allow both inline lookup and expanded lookup dialog
			        dv.updateLinkItemViews(0, dialogSetup, inlineSetup, dialogOnly);

			    }, null, null);
			},
		function (error) {
		    MobileCRM.bridge.alert("An error occurred: " + error);
		},
		null);
    }
    catch (err) {
        MobileCRM.bridge.alert(err);
    }
}