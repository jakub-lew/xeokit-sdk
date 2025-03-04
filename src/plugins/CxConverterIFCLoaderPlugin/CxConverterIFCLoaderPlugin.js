import { Plugin } from "../../viewer/Plugin.js";
import { GLTFLoaderPlugin } from "../GLTFLoaderPlugin/GLTFLoaderPlugin.js";
import { ifc2gltf } from "@creooxag/cx-converter";

/**
 * Fetches a file from the given URL and returns its contents as text.
 *
 * @param {string} url - The URL to fetch the file from.
 * @returns {Promise<string>} A promise that resolves to the file contents.
 * @private
 */
async function fetchFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    } catch (error) {
        console.error('Error fetching file:', error);
    }
}

/**
 * {@link Viewer} plugin that loads IFC models using the CxConverter library.
 */
class CxConverterIFCLoaderPlugin extends Plugin {
    /**
     * @constructor
     * @param {import("../../viewer/Viewer.js").Viewer} viewer The Viewer.
     * @param {Object} [cfg={}] Plugin configuration.
     */
    constructor(viewer, cfg = {}) {
        super("ifcLoader", viewer, cfg);

        /**
         * The GLTFLoaderPlugin used internally to load the converted GLTF.
         * @type {GLTFLoaderPlugin}
         */
        this.gltfLoader = new GLTFLoaderPlugin(this.viewer);
    }

    /**
     * Loads an IFC model from the given source.
     *
     * @param {Object} [params={}] Loading parameters.
     * @param {string} params.src Path to an IFC file.
     * @param {Function} [params.progressCallback] Callback to track loading progress.
     * @param {Function} [params.progressTextCallback] Callback to track loading progress with text updates.
     * @returns {Promise<import("../../viewer/scene/model/SceneModel.js").SceneModel>} A promise that resolves to the loaded SceneModel.
     */
    async load(params = {}) {
        if (!params.src) {
            this.error("load() param expected: src");
        }
        const data = await fetchFile(params.src);
        const { gltf, metaData } = await ifc2gltf(
            data,
            {
                remote: true,
                progressCallback: params.progressCallback,
                progressTextCallback: params.progressTextCallback
            }
        );
        const sceneModel = this.gltfLoader.load({
            id: "myModel",
            gltf: gltf,
            metaModelJSON: metaData
        });
        return sceneModel;
    }
}
export { CxConverterIFCLoaderPlugin };
