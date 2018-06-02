/*global location */
sap.ui.define([
  "emal/fiori/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "emal/fiori/model/formatter",
  "sap/ui/Device"
], function(BaseController, JSONModel, formatter, Device) {
  "use strict";

  return BaseController.extend("emal.fiori.controller.Detail", {

    formatter: formatter,

    /* =========================================================== */
    /* lifecycle methods                                           */
    /* =========================================================== */

    onInit: function() {
      // Model used to manipulate control states. The chosen values make sure,
      // detail page is busy indication immediately so there is no break in
      // between the busy indication for loading the view's meta data
      var oViewModel = new JSONModel({
        busy: true,
        delay: 0
      });

      this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

      this.setModel(oViewModel, "detailView");

      //this.getOwnerComponent().getModel("oDetailModel").metadataLoaded().then(this._onMetadataLoaded.bind(this));
    },

    /* =========================================================== */
    /* event handlers                                              */
    /* =========================================================== */

    /**
     * Event handler when the share by E-Mail button has been clicked
     * @public
     */
    onShareEmailPress: function() {
      var oViewModel = this.getModel("detailView");

      sap.m.URLHelper.triggerEmail(
        null,
        oViewModel.getProperty("/shareSendEmailSubject"),
        oViewModel.getProperty("/shareSendEmailMessage")
      );
    },

    /**
     * Event handler when the share in JAM button has been clicked
     * @public
     */
    onShareInJamPress: function() {
      var oViewModel = this.getModel("detailView"),
        oShareDialog = sap.ui.getCore().createComponent({
          name: "sap.collaboration.components.fiori.sharing.dialog",
          settings: {
            object: {
              id: location.href,
              share: oViewModel.getProperty("/shareOnJamTitle")
            }
          }
        });

      oShareDialog.open();
    },

    /* =========================================================== */
    /* begin: internal methods                                     */
    /* =========================================================== */

    /**
     * Binds the view to the object path and expands the aggregated line items.
     * @function
     * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
     * @private
     */
    _onObjectMatched: function(oEvent) {
      var sObjectId = oEvent.getParameter("arguments").objectId;
      this.loadDeatilData(sObjectId);
      /*this.getModel("oDetailModel").metadataLoaded().then(function() {
        this._bindView("/" + "ZFI_PETTY_CASH_MSet('" + sObjectId + "')");
      }.bind(this));*/
      /*  this.getModel("oDetailModel").metadataLoaded().then( function() {
          var sObjectPath = this.getModel("oDetailModel").createKey("ZFI_PETTY_CASH_MSet", {
            InstanceID :  sObjectId
          });
          this._bindView("/" + "ZFI_PETTY_CASH_MSet('000000142049')");
        }.bind(this));*/
    },
    loadDeatilData: function(sObjectId) {
      var oViewModel = this.getModel("detailView");
      var aFilters = [new sap.ui.model.Filter("WiId", sap.ui.model.FilterOperator.EQ, sObjectId)];
      var that = this;

      //Get Details Item
      this.getModel("oDetailModel").read("/ZFI_PETTY_CASH_MSet", { //new data set with description text
        filters: aFilters,
        success: function(oData, response) {
          //localModel.setProperty("/Detail", oData.results[0]);
          that.getView().getModel("LocalDetailModel").setData(oData.results[0]);
          //Loop
          var detTabTemp = new Array();
          var allTotTemp = 0;
          for (var i = 0; i < oData.results.length; i++) {
            var tempVal = parseFloat(oData.results[i].Wrbtr);
            allTotTemp = allTotTemp + tempVal;
            detTabTemp.push(oData.results[i]);
          }
          that.getModel("LocalItemModel").setData(detTabTemp);
          oViewModel.setProperty("/busy", false);
          //that.getModel("oDetailModel").setData("/", oData.results);
        },
        failed: function(oData, response) {
          //console.log("Failed to get Input Values from service!");
        }
      });

      //Get Workflow Logs
      this.getModel("oDetailModel").read("/ZWF_LOGSet", {
        filters: aFilters,
        success: function(oData, response) {
          that.getModel("LocalWorkflowLogsModel").setData(oData.results);
        },
        failed: function(oData, response) {
          //console.log("Failed to get Input Values from service!");
        }
      });

      //Get Attachments
      this.getModel("oDetailModel").read("/ZMOB_ATT_FILENAMESet", {
        filters: aFilters,
        success: function(oData, response) {
          that.getModel("LocalAttachmentModel").setData(oData.results);
        },
        failed: function(oData, response) {
          //console.log("Failed to get Input Values from service!");
        }
      });

    },

    /**
     * Binds the view to the object path. Makes sure that detail view displays
     * a busy indicator while data for the corresponding element binding is loaded.
     * @function
     * @param {string} sObjectPath path to the object to be bound to the view.
     * @private
     */
    _bindView: function(sObjectPath) {
      // Set busy indicator during view binding
      var oViewModel = this.getModel("detailView");

      // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
      oViewModel.setProperty("/busy", false);

      this.getView().bindElement({
        path: sObjectPath,
        events: {
          change: this._onBindingChange.bind(this),
          dataRequested: function() {
            oViewModel.setProperty("/busy", true);
          },
          dataReceived: function() {
            oViewModel.setProperty("/busy", false);
          }
        }
      });
    },

    _onBindingChange: function() {
      var oView = this.getView(),
        oElementBinding = oView.getElementBinding();

      // No data for the binding
      if (!oElementBinding.getBoundContext()) {
        this.getRouter().getTargets().display("detailObjectNotFound");
        // if object could not be found, the selection in the master list
        // does not make sense anymore.
        this.getOwnerComponent().oListSelector.clearMasterListSelection();
        return;
      }

      var sPath = oElementBinding.getPath(),
        oResourceBundle = this.getResourceBundle(),
        oObject = oView.getModel("oDetailModel").getObject(sPath),
        sObjectId = oObject.InstanceID,
        sObjectName = oObject.TaskTitle,
        oViewModel = this.getModel("detailView");

      this.getOwnerComponent().oListSelector.selectAListItem(sPath);

      oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
      oViewModel.setProperty("/shareOnJamTitle", sObjectName);
      oViewModel.setProperty("/shareSendEmailSubject",
        oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
      oViewModel.setProperty("/shareSendEmailMessage",
        oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
    },
    openApproveRejectDialog: function(a) {

      //var oController = sap.ui.getCore().byId("application-ZEGA_PC-approve-component---master").getController();
      //oController._selectNextWorkItem("selectNextWorkItem");
      //var C = "Z_10142";
      var d = "";
      var D = "";
      var s = "";
      var t = this;
      var b = false;
      var isRequired = false;
      switch (a.getSource().getProperty("text")) {
        case 'Approve':
          d = this.resourceBundle.getText("dialog.question.approve"/*, [C]*/);
          D = this.resourceBundle.getText("XTIT_APPROVAL");
          s = "0001";
          b = false;
          isRequired = true;
          this.sTextKey = "dialog.success.approve";
          break;
        case 'Reject':
          d = this.resourceBundle.getText("dialog.question.reject"/*, [C]*/);
          D = this.resourceBundle.getText("XTIT_REJECT");
          s = "0002";
          b = true;
          isRequired = false;
          this.sTextKey = "dialog.success.reject";
          break;
        case 'Send Back':
          d = this.resourceBundle.getText("dialog.question.sendback"/*, [C]*/);
          D = this.resourceBundle.getText("XTIT_SENDBACK");
          s = "0003";
          b = true;
          isRequired = false;
          this.sTextKey = "dialog.success.sendback";
          break;

        default:
          break;
      }
      new sap.m.Dialog(this.createId("s3ApproveRejectDialog"), {
        title: D,
        showHeader: true,
        showNote: b,
        content: [new sap.ui.layout.VerticalLayout({
          width: "100%",
          content: [new sap.m.Text(this.createId("S3ConfirmRejectDialogTextField"), {
            text: d
          }).addStyleClass("sapUiSmallMarginBottom"), new sap.m.TextArea(this.createId("S3ConfirmRejectDialogTextFieldForNotes"), {
            maxLength: 0,
            width: "100%",
            placeholder: this.resourceBundle.getText("dialog.ApproveRejectForward.NotePlaceHolder"),
            editable: true,
            visible: b,
            liveChange: function(oEvent) {
            var sText = oEvent.getParameter('value');
            var parent = oEvent.getSource().getParent();

              parent.getParent().getBeginButton().setEnabled(sText.length > 0);
            }
          })]
        })],
        beginButton: new sap.m.Button({
          text: this.resourceBundle.getText("XBUT_OK"),
          enabled: isRequired,
          press: function() {
            var n = t.byId("S3ConfirmRejectDialogTextFieldForNotes").getValue();
            var r = {
              isConfirmed: true,
              sNote: n
            };
            t.handleApproveRejectExecute(r, s);
            t.byId("s3ApproveRejectDialog").close();
          }
        }),
        endButton: new sap.m.Button({
          text: this.resourceBundle.getText("XBUT_CANCEL"),
          press: function() {
            t.byId("s3ApproveRejectDialog").close();
          }
        }),
        afterClose: function(e) {
          this.destroy();
        }
      }).addStyleClass("sapUiPopupWithPadding").open();
    },
    handleApproveRejectExecute: function(r, d) {
      var D = this.getView().getModel("LocalDetailModel").getData();
      var c;
      if (r.sNote) {
        c = r.sNote;
      } else {
        c = "";
      }
      this.getView().getModel().setRefreshAfterChange(false);
      this.getView().getModel().callFunction("Decision", "POST", {
      InstanceID: D.WiId,
      DecisionKey: d,
      Comments: c,
      SAP__Origin: "ECC_DUBAL_PGW"
    }, undefined, jQuery.proxy(this._handleApproveRejectSuccess, this), jQuery.proxy(this._handleApproveRejectForwardFail, this));
    },
    _handleApproveRejectSuccess: function(s) {
      var key = this.resourceBundle.getText(this.sTextKey);
      var S = "Petty cash no " + s.InstanceID + " has been "+key;
      if (s) {
        if(s.Status === "COMPLETED") {
          sap.m.MessageToast.show(S);
          var oController = sap.ui.getCore().byId("application-ZEGA_PC-approve-component---master").getController();
            oController._selectNextWorkItem("selectNextWorkItem");
        }
      }
    },
    _handleApproveRejectForwardFail: function(e) {
      var E = JSON.parse(e.response.body).error.message.value;

        var dialog = new sap.m.Dialog({
        title: 'Error',
        type: 'Message',
        state: 'Error',
        content: new sap.m.Text({
          text: E
        }),
        beginButton: new sap.m.Button({
          text: 'OK',
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function() {
          dialog.destroy();
        }
      });

      dialog.open();

    },
    selectTableRow: function(oEvent) {
      var localTblRowModele = this.getView().getModel("LocalItemModel");
      var oBindContext = oEvent.oSource.oBindingContexts;
      var oModel = oBindContext.LocalItemModel;
      var sRow = oModel.getProperty(oModel.sPath);
      localTblRowModele.setProperty("/", sRow);
      var seqNo = localTblRowModele.oData.Pbuzei; //notiflineObj[0].Arbpl ;
      this.getRouter().navTo("tableDetails", {
        SeqNo: seqNo
      });
    },
    onDocSelect: function(evt) {
      var FileName = evt.getSource().getTitle();
      var WiId = this.getView().getModel("LocalDetailModel").getData().WiId;
      var Belnr = this.getView().getModel("LocalDetailModel").getData().Pbelnr;

      var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
      var pdfURL = sOrigin + "/sap/opu/odata/sap/ZGW_PETTY_CASH_APPR_SRV/ZMOB_ATT_FILEDATASet(WiId='" + WiId +
        "',Belnr='" + Belnr + "',FileName='" +
        FileName + "')" + "\/\$value";

      parent.window.open(pdfURL, '_blank');

    },
    _onMetadataLoaded: function() {
      // Store original busy indicator delay for the detail view
      var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
        oViewModel = this.getModel("detailView");

      // Make sure busy indicator is displayed immediately when
      // detail view is displayed for the first time
      oViewModel.setProperty("/delay", 0);

      // Binding the view will set it to not busy - so the view is always busy if it is not bound
      oViewModel.setProperty("/busy", true);
      // Restore original busy indicator delay for the detail view
      oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
    },
    onCheckRefresh: function() {
      this.getRouter().navTo("master", {});
    }

  });

});