import { useEffect, useRef, useState } from 'react';
// import createImageIdsAndCacheMetaData from "./lib/createImageIdsAndCacheMetaData"
import {
  init as csRenderInit,
  Enums,
  RenderingEngine,
  Types /*, volumeLoader, imageLoader, metaData */,
} from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { init as csToolsInit } from '@cornerstonejs/tools';

import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

import {
  convertMultiframeImageIds /* initProviders, initVolumeLoader */,
  prefetchMetadataInformation,
} from './helper';
// import uids from './uids';

const {
  PanTool,
  WindowLevelTool,
  StackScrollTool,
  ZoomTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { MouseBindings } = csToolsEnums;
const { ViewportType } = Enums;

const toolGroupId = 'myToolGroup';

// 1st version
// volumeLoader.registerUnknownVolumeLoader(
//   cornerstoneStreamingImageVolumeLoader
// )

// https://github.com/cornerstonejs/cornerstone3D/blob/3062aecefb4115e44735550afbf9f33996cf8a02/packages/tools/examples/local/index.ts#L140
function App() {
  console.debug('app rendering');

  const elementRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const viewport = useRef(null);

  useEffect(() => {
    console.debug('Rendering engine initializing');

    // 1st version
    const setup = async () => {
      if (running.current) {
        return;
      }
      running.current = true;

      // 2nd
      // initMetaDataProviders();
      cornerstoneDICOMImageLoader.init();
      // initVolumeLoader(); // 2nd
      // await csRenderInit({ // 2nd
      //   peerImport,
      //   ...(config?.core ? config.core : {}),
      // });
      await csRenderInit(); //1st

      await csToolsInit(); //1st/2nd

      cornerstoneTools.addTool(PanTool);
      cornerstoneTools.addTool(WindowLevelTool);
      cornerstoneTools.addTool(StackScrollTool);
      cornerstoneTools.addTool(ZoomTool);

      // Define a tool group, which defines how mouse events map to tool commands for
      // Any viewport using the group
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      // Add tools to the tool group
      toolGroup.addTool(WindowLevelTool.toolName); // left press move
      toolGroup.addTool(PanTool.toolName); // middle press move
      toolGroup.addTool(ZoomTool.toolName); // double right click press move
      toolGroup.addTool(StackScrollTool.toolName);

      // Set the initial state of the tools, here all tools are active and bound to
      // Different mouse inputs
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Auxiliary, // Middle Click
          },
        ],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Secondary, // Right Click
          },
        ],
      });
      // As the Stack Scroll mouse wheel is a tool using the `mouseWheelCallback`
      // hook instead of mouse buttons, it does not need to assign any mouse button.
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Wheel }],
      });

      // Get Cornerstone imageIds and fetch metadata into RAM

      // Instantiate a rendering engine
      const renderingEngineId = 'myRenderingEngine';
      const renderingEngine = new RenderingEngine(renderingEngineId);

      // Create a stack viewport
      const viewportId = 'CT_STACK';
      const viewportInput = {
        viewportId,
        type: ViewportType.STACK,
        element: elementRef.current,
        defaultOptions: {
          background: [0.2, 0, 0.2] as Types.RGB,
        },
      };

      renderingEngine.enableElement(viewportInput);

      // Get the stack viewport that was created
      viewport.current = renderingEngine.getViewport(viewportId); // as unknown as <Types.IStackViewport>;

      toolGroup.addViewport(viewportId, renderingEngineId);

      // 2nd: for testings, you don't need any of these
      // volumeLoader.registerVolumeLoader('fakeVolumeLoader', fakeVolumeLoader);
      // imageLoader.registerImageLoader('fakeImageLoader', fakeImageLoader);
      // metaData.addProvider(fakeMetaDataProvider, 10000);

      // 1st
      // dicomImageLoaderInit({ maxWebWorkers: 1 })
      // // Get Cornerstone imageIds and fetch metadata into RAM
      // const imageIds = await createImageIdsAndCacheMetaData({
      //   StudyInstanceUID:
      //     "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
      //   SeriesInstanceUID:
      //     "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
      //   wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      // })
      // // Instantiate a rendering engine
      // const renderingEngineId = "myRenderingEngine"
      // const renderingEngine = new RenderingEngine(renderingEngineId)
      // const viewportId = "CT"
      // const viewportInput = {
      //   viewportId,
      //   type: Enums.ViewportType.ORTHOGRAPHIC,
      //   element: elementRef.current,
      //   defaultOptions: {
      //     orientation: Enums.OrientationAxis.SAGITTAL,
      //   },
      // }
      // renderingEngine.enableElement(viewportInput)
      // // Get the stack viewport that was created
      // const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport
      // // Define a volume in memory
      // const volumeId = "streamingImageVolume"
      // const volume = await volumeLoader.createAndCacheVolume(volumeId, {
      //   imageIds,
      // })
      // // Set the volume to load
      // // @ts-ignore
      // volume.load()
      // // Set the volume on the viewport and it's default properties
      // viewport.setVolumes([{ volumeId }])
      // // Render the image
      // viewport.render()

      console.debug('Rendering engine initialized');
      setIsInitialized(true);
    };
    setup();

    // Create a stack viewport
  }, [elementRef, running]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement> | Event,
  ): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (files.length === 0) return;

    try {
      console.log('Loading files:', files);

      // Create object URLs for the DICOM files
      // const imageIds = files.map(file => {
      //   const objectUrl = URL.createObjectURL(file);
      //   console.log('Created URL for file:', objectUrl);
      //   // return `wadouri:${objectUrl}`;
      //   return `dicomweb:${objectUrl}`;
      // });

      // console.log('File details:', files.map(f => ({
      //   name: f.name,
      //   size: f.size,
      //   type: f.type
      // })));

      // console.log('Image IDs:', imageIds);

      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(files[0]);

      // const files = event.dataTransfer.files;
      console.log('Image ID:', imageId);

      loadAndViewImage(imageId);

      // 1st:
      //   // Create rendering engine
      //   const renderingEngine = new RenderingEngine(renderingEngineId);
      //   console.log('Created rendering engine');

      //   // Create volume
      //   console.log('Creating volume with ID:', volumeId);
      //   const volume = await volumeLoader.createAndCacheVolume(volumeId, {
      //     imageIds,
      //   });
      //   console.log('Created volume:', volume);

      //   // @ts-ignore
      //   await volume.load();

      //   // Create viewport configurations
      //   const viewportConfigs = [
      //     {
      //       viewportId: 'AXIAL',
      //       type: Enums.ViewportType.ORTHOGRAPHIC,
      //       defaultOptions: {
      //         orientation: Enums.OrientationAxis.AXIAL,
      //       },
      //     },
      //     {
      //       viewportId: 'SAGITTAL',
      //       type: Enums.ViewportType.ORTHOGRAPHIC,
      //       defaultOptions: {
      //         orientation: Enums.OrientationAxis.SAGITTAL,
      //       },
      //     },
      //     {
      //       viewportId: 'CORONAL',
      //       type: Enums.ViewportType.ORTHOGRAPHIC,
      //       defaultOptions: {
      //         orientation: Enums.OrientationAxis.CORONAL,
      //       },
      //     },
      //     {
      //       viewportId: '3D',
      //       type: Enums.ViewportType.VOLUME_3D,
      //     },
      //   ];

      //   const elements = [
      //     viewportRefs.axial.current,
      //     viewportRefs.sagittal.current,
      //     viewportRefs.coronal.current,
      //     viewportRefs.volume3d.current,
      //   ];

      //   // Filter and create valid viewport inputs
      //   const validViewports = elements.reduce<ViewportInput[]>((acc, element, index) => {
      //     if (!element) return acc;

      //     const config = viewportConfigs[index];
      //     if (config.type === Enums.ViewportType.ORTHOGRAPHIC) {
      //       acc.push({
      //         // ... orthographic viewport configuration
      //       } as OrthographicViewportInput);
      //     } else {
      //       acc.push({
      //         // ... volume viewport configuration
      //       } as VolumeViewportInput);
      //     }
      //     return acc;
      //   }, []);

      //   // Enable elements and setup viewports
      //   for (const viewportInput of validViewports) {
      //       renderingEngine.enableElement(viewportInput);
      //     const viewport = renderingEngine.getViewport(viewportInput.viewportId);

      //     if (viewport instanceof BaseVolumeViewport) {
      //       await viewport.addVolumes([{ volumeId }]);
      //     }
      //   }

      //   // Set up tools
      //   const toolGroupId = 'MY_TOOLGROUP';
      //   const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      //   if (toolGroup) {
      //     toolGroup.addTool(RectangleROITool.toolName);

      //     toolGroup.setToolActive(RectangleROITool.toolName, {
      //       bindings: [
      //         {
      //           mouseButton: csToolsEnums.MouseBindings.Primary,
      //         },
      //       ],
      //     });

      //     validViewports.forEach(viewport => {
      //       if (viewport) {
      //         toolGroup.addViewport(viewport.viewportId, renderingEngineId);
      //       }
      //     });
      //   }

      //   // Render all viewports
      //   renderingEngine.render();
    } catch (error) {
      console.error('Error loading DICOM files:', error);
    }
  };

  const loadAndViewImage = async function (imageId) {
    await prefetchMetadataInformation([imageId]);
    const stack = convertMultiframeImageIds([imageId]);
    // Set the stack on the viewport
    viewport.current.setStack(stack).then(() => {
      // Set the VOI of the stack
      // viewport.setProperties({ voiRange: ctVoiRange });
      // Render the image
      viewport.current.render();

      // const imageData = viewport.getImageData();
      // const {
      //   pixelRepresentation,
      //   bitsAllocated,
      //   bitsStored,
      //   highBit,
      //   photometricInterpretation,
      // } = metaData.get('imagePixelModule', imageId);

      // const voiLutModule = metaData.get('voiLutModule', imageId);
      // const sopCommonModule = metaData.get('sopCommonModule', imageId);
      // const transferSyntax = metaData.get('transferSyntax', imageId);

      // document.getElementById('transfersyntax').innerHTML =
      //   transferSyntax.transferSyntaxUID;
      // document.getElementById('sopclassuid').innerHTML = `${
      //   sopCommonModule.sopClassUID
      // } [${uids[sopCommonModule.sopClassUID]}]`;
      // document.getElementById('sopinstanceuid').innerHTML =
      //   sopCommonModule.sopInstanceUID;
      // document.getElementById('rows').innerHTML = imageData.dimensions[0];
      // document.getElementById('columns').innerHTML = imageData.dimensions[1];
      // document.getElementById('spacing').innerHTML = imageData.spacing.join('\\');
      // document.getElementById('direction').innerHTML = imageData.direction
      //   .map((x) => Math.round(x * 100) / 100)
      //   .join(',');

      // document.getElementById('origin').innerHTML = imageData.origin
      //   .map((x) => Math.round(x * 100) / 100)
      //   .join(',');
      // document.getElementById('modality').innerHTML = imageData.metadata.Modality;

      // document.getElementById('pixelrepresentation').innerHTML =
      //   pixelRepresentation;
      // document.getElementById('bitsallocated').innerHTML = bitsAllocated;
      // document.getElementById('bitsstored').innerHTML = bitsStored;
      // document.getElementById('highbit').innerHTML = highBit;
      // document.getElementById('photometricinterpretation').innerHTML =
      //   photometricInterpretation;
      // document.getElementById('windowcenter').innerHTML =
      //   voiLutModule.windowCenter;
      // document.getElementById('windowwidth').innerHTML = voiLutModule.windowWidth;
    });
  };

  return (
    <div>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      <button
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = '.dcm';
          input.addEventListener('change', handleFileUpload);
          input.click();
        }}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        disabled={!isInitialized}
      >
        Select multiple DICOM files
      </button>
      <div
        ref={elementRef}
        style={{
          width: '512px',
          height: '512px',
          backgroundColor: '#000',
        }}
      ></div>
    </div>
  );
}

export default App;
