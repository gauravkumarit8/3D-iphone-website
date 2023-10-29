import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  BloomPlugin,
  GammaCorrectionPlugin,
  mobileAndTabletCheck,

  // Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from "webgi";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollAnimation } from "../lib/scroll-animation";
import { forwardRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const WebgiViewer = forwardRef((props, ref) => {
  const canvasRef = useRef(null);

  //create variable to see the view
  const [viewRef, setViewRef] = useState(null);
  const [targetRef, setTargetRef] = useState(null);
  const [cameraRef, setCamerRef] = useState(null);
  const [positionRef, setPositionRef] = useState(null);
  const canvasContainerRef = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [ismobile, setIsMobile] = useState(null);

  //what we want to preview
  useImperativeHandle(ref, () => ({
    triggerPreview() {
      setPreviewMode(true);
      canvasContainerRef.current.style.pointerEvents = "all";

      props.contentRef.current.style.opacity = "0";

      gsap.to(positionRef, {
        x: 13.04,
        y: -2.01,
        z: 2.29,
        duration: 2,
        onUpdate: () => {
          viewRef.setDirty();
          cameraRef.positionTargetUpdated(true);
        },
      });
      gsap.to(targetRef, { x: 0, y: 0.0, z: 0, duration: 2 });
      viewRef.scene.activeCamera.setCameraOptions({ controlsEnabled: true });
    },
  }));

  const memorizeScrollAnimation = useCallback(
    (position, target, ismobile, onUpdate) => {
      if (position && target && onUpdate) {
        scrollAnimation(position, target, ismobile, onUpdate);
      }
    },
    []
  );

  const setupViewer = useCallback(async () => {
    // Initialize the viewer
    const viewer = new ViewerApp({
      // canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
      canvas: canvasRef.current,
    });
    setViewRef(viewer);

    const mobileOrTablet = mobileAndTabletCheck();
    setIsMobile(mobileOrTablet);

    // Add some plugins
    const manager = await viewer.addPlugin(AssetManagerPlugin);

    //to animate the position we have to create this variable
    const camera = viewer.scene.activeCamera;
    setCamerRef(camera);
    const position = camera.position;
    setPositionRef(position);
    const target = camera.target;
    setTargetRef(target);

    // Add plugins individually.
    await viewer.addPlugin(GBufferPlugin);
    await viewer.addPlugin(new ProgressivePlugin(32));
    await viewer.addPlugin(new TonemapPlugin(true));
    await viewer.addPlugin(GammaCorrectionPlugin);
    await viewer.addPlugin(SSRPlugin);
    await viewer.addPlugin(SSAOPlugin);
    // await viewer.addPlugin(DiamondPlugin)
    // await viewer.addPlugin(FrameFadePlugin)
    // await viewer.addPlugin(GLTFAnimationPlugin)
    // await viewer.addPlugin(GroundPlugin)
    await viewer.addPlugin(BloomPlugin);
    // await viewer.addPlugin(TemporalAAPlugin)
    // await viewer.addPlugin(AnisotropyPlugin)
    // and many more...

    // // or use this to add all main ones at once.
    // await addBasePlugins(viewer)

    // // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
    // await viewer.addPlugin(CanvasSnipperPlugin)

    // This must be called once after all plugins are added.
    viewer.renderer.refreshPipeline();

    await manager.addFromPath("scene-black.glb");

    viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

    // Load an environment map if not set in the glb file
    // await viewer.setEnvironmentMap((await manager.importer!.importSinglePath<ITexture>("./assets/environment.hdr"))!);

    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });
    //when ever we visit the site always start from the top of model
    if (mobileOrTablet) {
      position.set(-16.7, 1.17, 11.7);
      target.set(0, 1.37, 0);
      props.contentRef.current.className = "mobile-or-tablet";
    }

    window.scrollTo(0, 0);

    let needUpdate = true;

    const onUpdate = () => {
      needUpdate = true;
      viewer.setDirty();
    };

    viewer.addEventListener("preFrame", () => {
      if (needUpdate) {
        camera.positionTargetUpdated(true);
        needUpdate = false;
      }
    });

    memorizeScrollAnimation(position, target, mobileOrTablet, onUpdate);
  }, []);

  useEffect(() => {
    setupViewer();
  }, []);

  const handleExit = useCallback(() => {
    //to exit the change we have done
    canvasContainerRef.current.style.pointerEvents = "none";
    props.contentRef.current.style.opacity = "1";
    viewRef.scene.activeCamera.setCameraOptions({ controlsEnabled: false });
    setPreviewMode(false);

    //bring model to its original position
    gsap.to(positionRef, {
      x: !ismobile ? 1.56 : 9.36,
      y: !ismobile ? 5.0 : 10.95,
      z: !ismobile ? 0.01 : 0.09,
      scrollTrigger: {
        trigger: ".display-section", //from which page and where to start animation
        start: "top bottom",
        end: "top top",
        scrub: 2,
        immediateRender: false,
      },
      onUpdate: () => {
        viewRef.setDirty();
        setCamerRef.positionTargetUpdated(true);
      },
    });
    gsap.to(targetRef, {
      x: !ismobile ? -0.55 : -1.62,
      y: !ismobile ? 0.32 : 0.02,
      z: !ismobile ? 0.0 : -0.06,
      scrollTrigger: {
        trigger: ".display-section", //from which page and where to start animation
        start: "top bottom",
        end: "top top",
        scrub: 2,
        immediateRender: false,
      },
    });
  }, [positionRef, canvasContainerRef, cameraRef, targetRef, viewRef]); //when to rerenderit

  return (
    <div ref={canvasContainerRef} id="webgi-canvas-container">
      <canvas id="webgi-canvas" ref={canvasRef} />
      {previewMode && (
        <button className="button" onClick={handleExit}>
          Exit
        </button>
      )}
    </div>
  );
});

export default WebgiViewer;
