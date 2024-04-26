import {addScript} from "../util/addScript";
import {Constants} from "../../constants";
import {genIconHTML} from "./util";
import {hasClosestByClassName} from "../util/hasClosest";

const ABCJS_PARAMS_KEY = "%%abcjsParams:";

// Read the abcjsParams from the content if it exists.
// The params *must* be the first line of the content in the form:
// %%abcjsParams: {JSON}
const getAbcParams = (abcString: string): any => {
    let params = {
        responsive: 'resize',
    };

    const firstLine = abcString.substring(0, abcString.indexOf("\n"));

    if (firstLine.startsWith(ABCJS_PARAMS_KEY)) {
        try {
            const jsonString = firstLine.substring(ABCJS_PARAMS_KEY.length);
            params = { ...params, ...JSON.parse(jsonString) };
        } catch (e) {
            console.error(`Failed to parse ABCJS params: ${e}`);
        }
    }

    return params;
};

export const abcRender = (element: Element, cdn = Constants.PROTYLE_CDN) => {
    let abcElements: Element[] = [];
    if (element.getAttribute("data-subtype") === "abc") {
        // 编辑器内代码块编辑渲染
        abcElements = [element];
    } else {
        abcElements = Array.from(element.querySelectorAll('[data-subtype="abc"]'));
    }
    if (abcElements.length === 0) {
        return;
    }
    if (abcElements.length > 0) {
        addScript(`${cdn}/js/abcjs/abcjs-basic-min.js?v=6.2.2`, "protyleAbcjsScript").then(() => {
            const wysiswgElement = hasClosestByClassName(element, "protyle-wysiwyg", true);
            abcElements.forEach((e: HTMLDivElement) => {
                if (e.getAttribute("data-render") === "true") {
                    return;
                }
                if (!e.firstElementChild.classList.contains("protyle-icons")) {
                    e.insertAdjacentHTML("afterbegin", genIconHTML(wysiswgElement));
                }
                const renderElement = e.firstElementChild.nextElementSibling as HTMLElement;
                renderElement.innerHTML = `<span style="position: absolute;left:0;top:0;width: 1px;">${Constants.ZWSP}</span><div contenteditable="false"></div>`;
                const abcString = Lute.UnEscapeHTMLStr(e.getAttribute("data-content"));
                const abcjsParams = getAbcParams(abcString)
                window.ABCJS.renderAbc(renderElement.lastElementChild, abcString, abcjsParams);
                e.setAttribute("data-render", "true");
            });
        });
    }
};
