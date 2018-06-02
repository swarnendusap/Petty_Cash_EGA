sap.ui.define([
	"emal/fiori/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(BaseController, Controller, History) {
	"use strict";

	return BaseController.extend("emal.fiori.controller.TableDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf emal.fioriapp.view.view.TableDetails
		 */
			onInit: function() {
				//this.getView().setModel(this.getOwnerComponent().getModel("LocalTblRowModel"),"LocalTblRowModele");
			},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf emal.fioriapp.view.view.TableDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf emal.fioriapp.view.view.TableDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf emal.fioriapp.view.view.TableDetails
		 */
		//	onExit: function() {
		//
		//	}
		onNavBack: function(oEvent) {
				var oHistory, sPreviousHash;
				oHistory = History.getInstance();
				sPreviousHash = oHistory.getPreviousHash();
				if (sPreviousHash !== undefined){
					window.history.go(-1);
				} else {
					//this.getRouter().navTo("appHome", {}, true);
								//var istat = this.getView().getModel('NotificationDetailModel').getData().Istat;
			this.getRouter().navTo("TaskCollection", {
				objectId: 1
			});
				}

			
		}
	});

});