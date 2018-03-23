//#region Imports
import * as qvangular                       from "qvangular";
import * as qlik                            from "qlik";
import * as template                        from "text!./q2g-ext-picassoWizardExtension.html";
import { utils,
         logging,
         services,
         version }                          from "../node_modules/davinci.js/dist/umd/daVinci";
import { PicassoWizardDirectiveFactory }    from "./q2g-ext-picassoWizardDirective";
//#endregion

//#region registrate services
qvangular.service<services.IRegistrationProvider>("$registrationProvider", services.RegistrationProvider)
.implementObject(qvangular);
//#endregion

//#region Directives
var $injector = qvangular.$injector;
utils.checkDirectiveIsRegistrated($injector, qvangular, "", PicassoWizardDirectiveFactory("Picassoextension"),
    "PicassoExtension");
//#endregion

//#region set extension parameters
let defaultCode = `
var data = [{
    type: 'matrix',
    data: [
    ['Year', 'Month', 'Sales', 'Margin'],
    ['2010', 'Jan', 1106, 7],
    ['2010', 'Feb', 5444, 53],
    ['2010', 'Mar', 147, 64],
    ['2010', 'Apr', 7499, 47],
    ['2010', 'May', 430, 62],
    ['2010', 'June', 9735, 13],
    ['2010', 'July', 7435, 15],
    ['2011', 'Jan', 1482, 45],
    ['2011', 'Feb', 2659, 76],
    ['2011', 'Mar', 1261, 73],
    ['2011', 'Apr', 3085, 56],
    ['2011', 'May', 3035, 91],
    ['2011', 'June', 7691, 88],
    ['2011', 'July', 3012, 81],
    ['2012', 'Jan', 7980, 61],
    ['2012', 'Feb', 2564, 22],
    ['2012', 'Mar', 7957, 98],
    ['2012', 'Apr', 5809, 1],
    ['2012', 'May', 429, 2],
    ['2012', 'June', 6757, 77],
    ['2012', 'July', 9415, 92]
    ]
}]

var settings = {
	scales: {
		s: {
			data: {
				field: 'Sales'
			},
			invert: true,
			expand: 0.1
		},
		m: {
			data: {
				field: 'Margin'
			},
			expand: 0.1
		}
	},
	components: [{
		type: 'axis',
		scale: 's',
		dock: 'left'
	}, {
		type: 'axis',
		scale: 'm',
		dock: 'bottom'
	}, {
		type: 'point',
		data: {
			extract: {
				field: 'Month',
				props: {
					y: {
						field: 'Sales'
					},
					mar: {
						field: 'Margin'
					}
				}
			}
		},
		settings: {
			x: {
				scale: 'm',
				ref: 'mar'
			},
			y: {
				scale: 's'
			},
			size: () => Math.random(),
			opacity: 0.8
		}
	}]
};

let chart = picasso.chart({
	element: element,
	data: data,
	settings: settings
});

console.log("CHART", chart);

`;
let parameter = {
    type: "items",
    component: "accordion",
    items: {
        dimensions: {
            uses: "dimensions",
            min: 1
        },
        measures: {
            uses: "measures",
            min: 1
        },
        settings: {
            uses: "settings",
            items: {
                configuration: {
                    type: "items",
                    label: "Configuration",
                    grouped: true,
                    items: {
                        code: {
                            ref: "properties.code",
                            label: "focus search field",
                            type: "string",
                            defaultValue: defaultCode,
                            show: function () {
                                return false;
                            }
                        },
                        showEditMode: {
                            ref: "properties.showEditMode",
                            label: "show Edit Mode",
                            component: "switch",
                            type: "boolean",
                            options: [{
                                value: true,
                                label: "show"
                            }, {
                                value: false,
                                label: "hide"
                            }],
                            defaultValue: true
                        },
                    }
                }
            }
        }
    }
};
//#endregion


class PicassoWizardExtension {

    model: EngineAPI.IGenericObject;

    constructor(model: EngineAPI.IGenericObject) {
        this.model = model;
    }

    public isEditMode() {
        if (qlik.navigation.getMode() === "analysis") {
            return false;
        } else {
            return true;
        }
    }
}

export = {
    definition: parameter,
    initialProperties: {
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [
                {
                    qWidth: 10,
                    qHeight: 100
                }
            ]
        }
    },
    template: template,
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    paint: () => {
        //
    },
    resize: () => {
        //
    },
    controller: ["$scope", function (scope: utils.IVMScope<PicassoWizardExtension>) {
        scope.vm = new PicassoWizardExtension(utils.getEnigma(scope));
    }]
};


