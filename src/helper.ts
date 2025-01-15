import {
  cornerstoneStreamingDynamicImageVolumeLoader,
  cornerstoneStreamingImageVolumeLoader,
  metaData,
  volumeLoader,
} from '@cornerstonejs/core';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import type { Types } from '@cornerstonejs/tools';
import * as cornerstoneTools from '@cornerstonejs/tools';
// https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initProviders.js#L6
import * as cornerstone from '@cornerstonejs/core';
import ptScalingMetaDataProvider from './ptScalingMetaDataProvider';

const {
  LengthTool,
  StackScrollTool,
  PanTool,
  ZoomTool,
  TrackballRotateTool,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { MouseBindings, KeyboardBindings } = csToolsEnums;

const { calibratedPixelSpacingMetadataProvider } = cornerstone.utilities;

export function initMetaDataProviders() {
  metaData.addProvider(ptScalingMetaDataProvider.get.bind(ptScalingMetaDataProvider), 10000);
  metaData.addProvider(
    calibratedPixelSpacingMetadataProvider.get.bind(calibratedPixelSpacingMetadataProvider),
    11000,
  );
}

// https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initVolumeLoader.js
export function initVolumeLoader() {
  volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
  volumeLoader.registerVolumeLoader(
    'cornerstoneStreamingImageVolume',
    cornerstoneStreamingImageVolumeLoader,
  );
  volumeLoader.registerVolumeLoader(
    'cornerstoneStreamingDynamicImageVolume',
    cornerstoneStreamingDynamicImageVolumeLoader,
  );
}

// ref: https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/convertMultiframeImageIds.js

/**
 * preloads imageIds metadata in memory
 **/
async function prefetchMetadataInformation(imageIdsToPrefetch) {
  for (let i = 0; i < imageIdsToPrefetch.length; i++) {
    await cornerstoneDICOMImageLoader.wadouri.loadImage(imageIdsToPrefetch[i]).promise;
  }
}

function getFrameInformation(imageId) {
  if (imageId.includes('wadors:')) {
    const frameIndex = imageId.indexOf('/frames/');
    const imageIdFrameless = frameIndex > 0 ? imageId.slice(0, frameIndex + 8) : imageId;
    return {
      frameIndex,
      imageIdFrameless,
    };
  } else {
    const frameIndex = imageId.indexOf('&frame=');
    let imageIdFrameless = frameIndex > 0 ? imageId.slice(0, frameIndex + 7) : imageId;
    if (!imageIdFrameless.includes('&frame=')) {
      imageIdFrameless = imageIdFrameless + '&frame=';
    }
    return {
      frameIndex,
      imageIdFrameless,
    };
  }
}

/**
 * Receives a list of imageids possibly referring to multiframe dicom images
 * and returns a list of imageid where each imageid referes to one frame.
 * For each imageId representing a multiframe image with n frames,
 * it will create n new imageids, one for each frame, and returns the new list of imageids
 * If a particular imageid no refer to a mutiframe image data, it will be just copied into the new list
 * @returns new list of imageids where each imageid represents a frame
 */
function convertMultiframeImageIds(imageIds) {
  const newImageIds = [];
  imageIds.forEach((imageId) => {
    const { imageIdFrameless } = getFrameInformation(imageId);
    const instanceMetaData = metaData.get('multiframeModule', imageId);
    if (
      instanceMetaData &&
      instanceMetaData.NumberOfFrames &&
      instanceMetaData.NumberOfFrames > 1
    ) {
      const NumberOfFrames = instanceMetaData.NumberOfFrames;
      for (let i = 0; i < NumberOfFrames; i++) {
        const newImageId = imageIdFrameless + (i + 1);
        newImageIds.push(newImageId);
      }
    } else {
      newImageIds.push(imageId);
    }
  });
  return newImageIds;
}

export { convertMultiframeImageIds, prefetchMetadataInformation };

// https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initDemo.js#L22
// export async function peerImport(moduleId) {
//     if (moduleId === 'dicom-microscopy-viewer') {
//       return importGlobal(
//         '/dicom-microscopy-viewer/dicomMicroscopyViewer.min.js',
//         'dicomMicroscopyViewer'
//       );
//     }

//     if (moduleId === '@icr/polyseg-wasm') {
//       return import('@icr/polyseg-wasm');
//     }
// }
// async function importGlobal(path, globalName) {
//     await import(/* webpackIgnore: true */ path);
//     return window[globalName];
// }

export type ToolBinding = {
  // A base tool to register.  Should only be defined once per tool
  tool?: any;
  // The tool name to base this on
  baseTool?: string;
  // The configuration to register with
  configuration?: Record<string, any>;
  // Sets to passive initially
  passive?: boolean;
  // Initial bindings
  bindings?: Types.IToolBinding[];
};

let registered = false;
export function addManipulationBindings(
  toolGroup,
  options: {
    enableShiftClickZoom?: boolean;
    is3DViewport?: boolean;
    toolMap?: Map<string, ToolBinding>;
  } = {},
) {
  const zoomBindings: Types.IToolBinding[] = [
    {
      mouseButton: MouseBindings.Secondary,
    },
  ];

  const { is3DViewport = false, enableShiftClickZoom = false, toolMap = new Map() } = options;

  if (enableShiftClickZoom === true) {
    zoomBindings.push({
      mouseButton: MouseBindings.Primary, // Shift Left Click
      modifierKey: KeyboardBindings.Shift,
    });
  }

  if (!registered) {
    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.addTool(ZoomTool);
    cornerstoneTools.addTool(TrackballRotateTool);
    cornerstoneTools.addTool(LengthTool);
    cornerstoneTools.addTool(StackScrollTool);
    for (const [, config] of toolMap) {
      if (config.tool) {
        cornerstoneTools.addTool(config.tool);
      }
    }
  }

  registered = true;

  toolGroup.addTool(PanTool.toolName);
  // Allow significant zooming to occur
  toolGroup.addTool(ZoomTool.toolName, {
    minZoomScale: 0.001,
    maxZoomScale: 4000,
  });
  if (is3DViewport) {
    toolGroup.addTool(TrackballRotateTool.toolName);
  } else {
    toolGroup.addTool(StackScrollTool.toolName);
  }
  toolGroup.addTool(LengthTool.toolName);
  toolGroup.addTool(StackScrollTool.toolName);

  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary,
      },
      {
        numTouchPoints: 1,
        modifierKey: KeyboardBindings.Ctrl,
      },
    ],
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: zoomBindings,
  });
  // Need a binding to navigate without a wheel mouse
  toolGroup.setToolActive(StackScrollTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary,
        modifierKey: KeyboardBindings.Alt,
      },
      {
        numTouchPoints: 1,
        modifierKey: KeyboardBindings.Alt,
      },
      {
        mouseButton: MouseBindings.Wheel,
      },
    ],
  });
  // Add a length tool binding to allow testing annotations on examples targetting
  // other use cases.  Use a primary button with shift+ctrl as that is relatively
  // unlikely to be otherwise used.
  toolGroup.setToolActive(LengthTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary,
        modifierKey: KeyboardBindings.ShiftCtrl,
      },
      {
        numTouchPoints: 1,
        modifierKey: KeyboardBindings.ShiftCtrl,
      },
    ],
  });

  if (is3DViewport) {
    toolGroup.setToolActive(TrackballRotateTool.toolName, {
      bindings: [
        {
          mouseButton: MouseBindings.Primary,
        },
      ],
    });
  } else {
    toolGroup.setToolActive(StackScrollTool.toolName);
  }

  // Add extra tools from the toolMap
  for (const [toolName, config] of toolMap) {
    if (config.baseTool) {
      if (!toolGroup.hasTool(config.baseTool)) {
        toolGroup.addTool(config.baseTool, toolMap.get(config.baseTool)?.configuration);
      }
      toolGroup.addToolInstance(toolName, config.baseTool, config.configuration);
    } else if (!toolGroup.hasTool(toolName)) {
      toolGroup.addTool(toolName, config.configuration);
    }
    if (config.passive) {
      // This can be applied during add/remove contours
      toolGroup.setToolPassive(toolName);
    }
    if (config.bindings || config.selected) {
      toolGroup.setToolActive(
        toolName,
        (config.bindings && config) || {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        },
      );
    }
  }
}
