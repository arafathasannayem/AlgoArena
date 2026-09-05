/**
 * CameraController — Interactive orbit, pan, and zoom controller.
 *
 * Integrates Drei's OrbitControls with the cameraStore, supporting:
 * - Mouse rotation / pan / wheel zoom
 * - On-screen Zoom In / Zoom Out buttons
 * - Isometric and Top-Down view presets
 * - Automatic view reset fitting current grid dimensions
 *
 * Updates camera via R3F useFrame to avoid React 19 hook immutability issues.
 *
 * @module scene/CameraController
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrthographicCamera } from 'three';
import { useCameraStore } from '../state/cameraStore';

interface CameraControllerProps {
  defaultZoom: number;
}

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>;

export function CameraController({ defaultZoom }: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsRef>(null);

  // Process zoom and camera actions inside R3F render loop
  useFrame(({ camera }) => {
    const action = useCameraStore.getState().zoomAction;
    if (!action) return;

    if (!(camera instanceof OrthographicCamera)) {
      useCameraStore.getState().clearAction();
      return;
    }

    const controls = controlsRef.current;

    switch (action) {
      case 'in': {
        camera.zoom = Math.min(150, Math.round(camera.zoom * 1.25));
        camera.updateProjectionMatrix();
        useCameraStore.getState().setZoomLevel(camera.zoom);
        break;
      }
      case 'out': {
        camera.zoom = Math.max(10, Math.round(camera.zoom / 1.25));
        camera.updateProjectionMatrix();
        useCameraStore.getState().setZoomLevel(camera.zoom);
        break;
      }
      case 'reset':
      case 'iso': {
        camera.position.set(40, 40, 40);
        camera.zoom = defaultZoom;
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        useCameraStore.getState().setZoomLevel(defaultZoom);
        break;
      }
      case 'top': {
        camera.position.set(0, 60, 0.001);
        camera.zoom = defaultZoom;
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        useCameraStore.getState().setZoomLevel(defaultZoom);
        break;
      }
    }

    useCameraStore.getState().clearAction();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minZoom={10}
      maxZoom={150}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={0.05}
    />
  );
}
