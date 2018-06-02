sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "emal/fiori/model/models",
  "emal/fiori/controller/ListSelector",
  "emal/fiori/controller/ErrorHandler",
  "sap/ui/model/odata/ODataModel",
  "sap/ui/model/json/JSONModel",
  "emal/fiori/model/formatter"
], function(UIComponent, Device, models, ListSelector, ErrorHandler, ODataModel, JSONModel) {
  "use strict";

  return UIComponent.extend("emal.fiori.Component", {

    metadata: {
      "version": "1.0.0",
      "rootView": {
        "viewName": "emal.fiori.view.App",
        "type": "XML",
        "id": "app"
      },
      "includes": ["util/formatter.js", "css/custom.css"],
      "dependencies": {
        "libs": ["sap.ui.core", "sap.m", "sap.ui.layout"]
      },
      "config": {
        "i18nBundle": "emal.fiori.i18n.i18n",
        //"serviceUrl": "/sap/opu/odata/iwpgw/TASKPROCESSING;mo/",
        serviceConfig: {
          name: "localData",
          serviceUrle: "/sap/opu/odata/IWPGW/TASKPROCESSING;mo/",
          detailUrle: "/sap/opu/odata/sap/ZGW_PETTY_CASH_APPR_SRV;mo/",
          local: true
        },
        "icon": "",
        "favIcon": "",
        "phone": "",
        "phone@2": "",
        "tablet": "",
        "tablet@2": ""
      },
      "routing": {
        "config": {
          "routerClass": "sap.m.routing.Router",
          "viewType": "XML",
          "viewPath": "emal.fiori.view",
          "controlId": "idAppControl",
          "controlAggregation": "detailPages",
          "bypassed": {
            "target": ["master", "notFound"]
          }
        },

        "routes": [{
          "pattern": "",
          "name": "master",
          "target": ["object", "master"]
        }, {
          "pattern": "TaskCollection/{objectId}",
          "name": "object",
          "target": ["master", "object"]
        }, {
          "pattern": "tableDetail/{SeqNo}}",
          "name": "tableDetails",
          "target": ["master", "tablDetail"]
        }],

        "targets": {
          "master": {
            "viewName": "Master",
            "viewLevel": 1,
            "viewId": "master",
            "controlAggregation": "masterPages"
          },
          "object": {
            "viewName": "Detail",
            "viewId": "detail",
            "viewLevel": 2,
            "controlAggregation": "detailPages"
          },
          "tablDetail": {
            "viewName": "TableDetails",
            "viewId": "TableDetails",
            "viewLevel": 2,
            "controlAggregation": "detailPages"
          },
          "detailObjectNotFound": {
            "viewName": "DetailObjectNotFound",
            "viewId": "detailObjectNotFound"
          },
          "detailNoObjectsAvailable": {
            "viewName": "DetailNoObjectsAvailable",
            "viewId": "detailNoObjectsAvailable"
          },
          "notFound": {
            "viewName": "NotFound",
            "viewId": "notFound"
          }
        }
      }
    },

    /**
     * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
     * In this method, the resource and application models are set and the router is initialized.
     * @public
     * @override
     */
    init: function() {
      this.oListSelector = new ListSelector();
      //this._oErrorHandler = new ErrorHandler(this);
      var mConfig = this.getMetadata().getConfig();
      var serviceConfig = mConfig.serviceConfig;
      //var oRootPath = $.sap.getModulePath("emalDubalAR");

      var sServiceUrle = serviceConfig.serviceUrle;
      var sDetailUrle = serviceConfig.detailUrle;

      var oModele = new ODataModel(sServiceUrle, {
        useBatch: true,
        defaultUpdateMethod: 'PATCH',
        json: true,
        countSupported: true
      });
      var oDtlModele = new ODataModel(sDetailUrle, {
        useBatch: true,
        defaultUpdateMethod: 'PATCH',
        json: true,
        countSupported: true
      });

      this.setModel(oModele);
      this.setModel(oDtlModele, "oDetailModel");

      /*****Local Models for storing View Fields data******/
      var oJsonModel = new JSONModel();
      this.setModel(oJsonModel, "LocalDetailModel");
      var oJsonModel1 = new JSONModel();
      this.setModel(oJsonModel1, "LocalItemModel");
      var oJsonModel2 = new JSONModel();
      this.setModel(oJsonModel2, "LocalAttachmentModel");
      var oJsonModel3 = new JSONModel();
      this.setModel(oJsonModel3, "LocalWorkflowLogsModel");
    /*  var oJsonModel4 = new JSONModel();
      this.setModel(oJsonModel4, "LocalTblRowModel");*/

      // creating and setting the necessary models
      // set the device model
      this.setModel(models.createDeviceModel(), "device");
      // set the FLP model
      //this.setModel(models.createFLPModel(), "FLP");

      // create and set the ODataModel
      // var oModel = models.createODataModel({
      //  urlParametersForEveryRequest: [
      //    "sap-server",
      //    "sap-client",
      //    "sap-language"
      //  ],
      //  url: this.getMetadata().getConfig().serviceUrl,
      //  config: {
      //    metadataUrlParams: {
      //      "sap-documentation": "heading"
      //    }
      //  }
      // });

      // this.setModel(oModel);
      // this._createMetadataPromise(oModel);

      // set the i18n model
      this.setModel(models.createResourceModel(mConfig.i18nBundle), "i18n");

      // this.oListSelector = new ListSelector();
      // this._oErrorHandler = new ErrorHandler(this);
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);
      // create the views based on the url/hash
      this.getRouter().initialize();
    },

    /**
     * The component is destroyed by UI5 automatically.
     * In this method, the ListSelector and ErrorHandler are destroyed.
     * @public
     * @override
     */
    destroy: function() {
      this.oListSelector.destroy();
      //this._oErrorHandler.destroy();
      //this.getModel().destroy();
      //this.getModel("i18n").destroy();
      //this.getModel("FLP").destroy();
      //this.getModel("device").destroy();
      // call the base component's destroy function
      UIComponent.prototype.destroy.apply(this, arguments);
    },

    /**
     * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
     * design mode class should be set, which influences the size appearance of some controls.
     * @public
     * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
     */
    getContentDensityClass: function() {
      if (this._sContentDensityClass === undefined) {
        // check whether FLP has already set the content density class; do nothing in this case
        if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
          this._sContentDensityClass = "";
        } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
          this._sContentDensityClass = "sapUiSizeCompact";
        } else {
          // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
          this._sContentDensityClass = "sapUiSizeCozy";
        }
      }
      return this._sContentDensityClass;
    },

    /**
     * Creates a promise which is resolved when the metadata is loaded.
     * @param {sap.ui.core.Model} oModel the app model
     * @private
     */
    _createMetadataPromise: function(oModel) {
      this.oWhenMetadataIsLoaded = new Promise(function(fnResolve, fnReject) {
        oModel.attachEventOnce("metadataLoaded", fnResolve);
        oModel.attachEventOnce("metadataFailed", fnReject);
      });
    }

  });

});