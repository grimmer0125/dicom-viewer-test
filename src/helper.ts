import { metaData } from '@cornerstonejs/core';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
// import { utilities as csUtils } from '@cornerstonejs/core';
import {
  cornerstoneStreamingDynamicImageVolumeLoader,
  cornerstoneStreamingImageVolumeLoader,
  volumeLoader,
} from '@cornerstonejs/core';

// https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initProviders.js#L6
import * as cornerstone from '@cornerstonejs/core';

import ptScalingMetaDataProvider from './ptScalingMetaDataProvider';

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
