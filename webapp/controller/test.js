var oTable = new sap.ui.table.Table({
            id: "employeeListTable",
            columns: [
                          new sap.ui.table.Column({
                              label: new sap.ui.commons.Label({text: "Vorname"}),
                            template: new sap.ui.commons.TextView().bindProperty("text", "firstname"),
                            sortProperty: "name",
                            filterProperty: "name"
                          }),
                          new sap.ui.table.Column({
                              label: new sap.ui.commons.Label({text: "Nachname"}),
                            template: new sap.ui.commons.TextView().bindProperty("text", "lastname"),
                            sortProperty: "name",
                            filterProperty: "name"
                          }),
                          new sap.ui.table.Column({
                              label: new sap.ui.commons.Label({text: "Alter"}),
                            template: new sap.ui.commons.TextView().bindProperty("text", "age"),
                            sortProperty: "name",
                            filterProperty: "name"
                          }),
                          new sap.ui.table.Column({
                              label: new sap.ui.commons.Label({text: "Aktionen"}),
                            template: new sap.ui.commons.Button({
                                text: "Bearbeiten",
                                press: oController.onEditButtonClicked                            
                            }),
                            sortProperty: "name",
                            filterProperty: "name"
                          })
                      ]
        });
        
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.loadData("data/employees.json");
        oTable.setModel(oModel);
        oTable.bindRows("/employees");