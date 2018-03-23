//#region Imports
import { utils,
         logging }              from "../node_modules/davinci.js/dist/umd/daVinci";
import * as qvangular           from "qvangular";
import * as template            from "text!./q2g-ext-picassoWizardDirective.html";
import * as picassoImport       from "../node_modules/picasso.js/dist/picasso";
import * as picassoQ            from "../node_modules/picasso-plugin-q/dist/picasso-q";
import * as  picassoHammer      from "../node_modules/picasso-plugin-hammer/dist/picasso-hammer";
import "../node_modules/ace-builds/src/ace";
import "css!./q2g-ext-picassoWizardDirective.css";
//#endregion

//#region declaration of const
const timer = 50;
const picasso: any = picassoImport;
picasso.use(picassoQ);
picasso.use(picassoHammer);
//#endregion

//#region Interfaces
export interface IProperties {
    showEditMode: boolean;
    code: string;
}
//#endregion

class PicassoWizardController {

    //#region Variables
    editor: AceAjax.Editor;
    element: JQuery;
    parseError: boolean = false;
    properties: IProperties;
    runEditorCode: Function;
    timeout: ng.ITimeoutService;
    hc: EngineAPI.IHyperCube;
    chartElement: Element;
    picassoData: any;
    //#endregion

    //#region showEditMode
    private _showEditMode: boolean;
    public get showEditMode() : boolean {
        if (typeof(this._showEditMode) !== "undefined") {
            return this._showEditMode;
        }
        return true;
    }
    public set showEditMode(v : boolean) {
        if(v !== this._showEditMode) {
            this._showEditMode = v;
            if (v) {
                this.editor = ace.edit("editor");
                this.editor.session.setMode("ace/mode/javascript");
                this.editor.setValue(this.properties.code);
                this.editor.on("change", (e) => {
                    this.chartDefinition = this.editor.getValue();
                });
            }
            if (typeof(this.runEditorCode)!=="undefined") {
                this.runParsedCode();
            }
        }
    }
    //#endregion

    //#region chartDefinition
    private _chartDefinition: string = "";
    public get chartDefinition() : string {
        return this._chartDefinition;
    }
    public set chartDefinition(v : string) {
        this._chartDefinition = v;

        try {

            this.runEditorCode = Function("picasso", "data", "element", v);
            this.parseError = false;
        } catch (e) {
            this.parseError = true;
        }

        try {
            this.model.getProperties()
            .then((res) => {
                res.properties.code = v;
                return this.model.setProperties(res);
            })
            .then(() => {
                this.runParsedCode();
            })
            .catch((e) => {
                console.log("ERROR", e);
            });
        } catch (error) {
            this.logger.error("error", error);
        }

    }
    //#endregion

    //#region logger
    private _logger: logging.Logger;
    private get logger(): logging.Logger {
        if (!this._logger) {
            try {
                this._logger = new logging.Logger("SelectionsController");
            } catch (e) {
                console.error("ERROR in create logger instance", e);
            }
        }
        return this._logger;
    }
    //#endregion

    //#region model
    private _model: EngineAPI.IGenericObject;
    get model(): EngineAPI.IGenericObject {
        return this._model;
    }
    set model(v: EngineAPI.IGenericObject) {
        if (v !== this._model) {
            try {
                this._model = v;

                v.getProperties()
                    .then((res) => {
                        this.chartDefinition = res.properties.code;
                    })
                .catch((e) => {
                    this.logger.error("ERROR in setter of model when calling getProperties", e);
                });

                let that = this;
                v.on("changed", function () {
                    this.getLayout()
                        .then((res: EngineAPI.IGenericHyperCubeLayout) => {
                            that.hc = res.qHyperCube;
                            that.picassoData = [{
                                type: "q",
                                key: "qHyperCube",
                                data: res.qHyperCube
                            }];
                            that.runParsedCode();

                            return this.getProperties();
                        })
                        .then((res) => {
                            if (JSON.stringify(that.properties) !== JSON.stringify(res.properties)) {
                                that.properties = JSON.parse(JSON.stringify(res.properties));
                                that.showEditMode = res.properties.showEditMode;
                            }
                        })
                    .catch((error) => {
                        console.error("Error in on change of selector object", error);
                    });
                });
                this.model.emit("changed");
            } catch (e) {
                this.logger.error("error", e);
            }
        }
    }
    //#endregion

    //#region constructor
    static $inject = ["$timeout", "$element", "$scope"];

    /**
     * init of the controller for the Direction Directive
     * @param timeout
     * @param element
     */
    constructor(timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope) {
        this.element = element;
        this.timeout = timeout;
        this.chartElement = document.querySelector("#q2gPicChart");

        scope.$watch(() => {
            return this.element.width() + this.element.height();
        }, () => {
            if (typeof(this.runEditorCode)!=="undefined") {
                this.runParsedCode();
            }
        });
    }
    //#endregion

    /**
     * runs the parsed code from editor, when parse error no execution
     */
    private runParsedCode(): void {
        if (!this.parseError) {
            setTimeout(() => {
                this.runEditorCode(picasso, this.picassoData, this.chartElement);
            }, timer);
        }
    }
}

export function PicassoWizardDirectiveFactory(rootNameSpace: string): ng.IDirectiveFactory {
    return($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
        return {
            restrict: "E",
            replace: true,
            template: utils.templateReplacer(template, rootNameSpace),
            controller: PicassoWizardController,
            controllerAs: "vm",
            scope: {},
            bindToController: {
                model: "<",
                theme: "<?",
                editMode: "<?"
            }
        };
    };
}