/**
 * maths_3d.js - Interactive 3D Math Exploratorium for Class 7 & 8
 * Powered by Three.js (WebGL) with custom touch/mouse orbital interaction
 */

(function () {
  'use strict';

  // Fallback / Standalone Orbit Controller (zero external CDN dependency)
  function attachOrbitControls(camera, domElement, options = {}) {
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let theta = options.theta !== undefined ? options.theta : 0.6;
    let phi = options.phi !== undefined ? options.phi : 1.1;
    let radius = options.radius || 7;
    const target = options.target || new THREE.Vector3(0, 0.8, 0);

    function updateCamera() {
      phi = Math.max(0.1, Math.min(Math.PI / 2 + 0.25, phi));
      radius = Math.max(2, Math.min(25, radius));
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);
    }
    updateCamera();

    domElement.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      try { domElement.setPointerCapture(e.pointerId); } catch (_) {}
    });

    domElement.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      theta -= dx * 0.012;
      phi -= dy * 0.012;
      updateCamera();
    });

    const stopDrag = () => { isDragging = false; };
    domElement.addEventListener('pointerup', stopDrag);
    domElement.addEventListener('pointercancel', stopDrag);

    domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      radius += e.deltaY * 0.005;
      updateCamera();
    }, { passive: false });

    return {
      update: () => {},
      rotateStep: (dTheta) => {
        if (!isDragging) {
          theta += dTheta;
          updateCamera();
        }
      },
      setOrientation: (t, p, r) => {
        theta = t;
        phi = p;
        if (r) radius = r;
        updateCamera();
      }
    };
  }

  // Ensure THREE is available or wait for it
  function initWhenReady() {
    if (typeof THREE === 'undefined') {
      setTimeout(initWhenReady, 100);
      return;
    }
    try { initPolyhedraLab(); } catch (e) { console.error('Polyhedra Lab error:', e); }
    try { initPlaneIntersectionLab(); } catch (e) { console.error('Plane Lab error:', e); }
    try { initFraction3DVoxelLab(); } catch (e) { console.error('Fraction Lab error:', e); }
  }

  /* =========================================================================
     1. 3D Polyhedra & Dynamic Net Unfolder (Chapter 7: Geometry in 3D)
     ========================================================================= */
  let polyScene, polyCamera, polyRenderer, polyOrbit, polyMeshGroup;
  let currentPolyType = 'tetrahedron';
  let unfoldProgress = 0;
  let showAltitude = false;
  let wireframeMode = false;
  let autoRotatePoly = true;

  function initPolyhedraLab() {
    const container = document.getElementById('polyhedra-3d-canvas');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    polyScene = new THREE.Scene();
    polyCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    polyCamera.position.set(0, 4, 7);

    polyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    polyRenderer.setSize(width, height);
    polyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(polyRenderer.domElement);

    polyOrbit = attachOrbitControls(polyCamera, polyRenderer.domElement, { radius: 7.5, phi: 1.1, theta: 0.5 });

    // Lighting
    polyScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(5, 10, 7);
    polyScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.8);
    dirLight2.position.set(-5, -2, -5);
    polyScene.add(dirLight2);

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0x3b82f6, 0x1e293b);
    grid.position.y = -0.01;
    polyScene.add(grid);

    polyMeshGroup = new THREE.Group();
    polyScene.add(polyMeshGroup);

    buildPolyhedron();
    setupPolyControls();

    function animate() {
      requestAnimationFrame(animate);
      if (autoRotatePoly && unfoldProgress === 0 && polyOrbit) {
        polyOrbit.rotateStep(0.005);
      }
      polyRenderer.render(polyScene, polyCamera);
    }
    animate();

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      polyCamera.aspect = w / h;
      polyCamera.updateProjectionMatrix();
      polyRenderer.setSize(w, h);
    });
  }

  function buildPolyhedron() {
    while (polyMeshGroup.children.length > 0) {
      polyMeshGroup.remove(polyMeshGroup.children[0]);
    }

    const t = unfoldProgress;

    if (currentPolyType === 'tetrahedron') {
      buildTetrahedronWithNet(t);
      updateEulerInfo(4, 6, 4, 'Tetrahedron (Triangular Pyramid)');
    } else if (currentPolyType === 'prism') {
      buildTriangularPrismWithNet(t);
      updateEulerInfo(6, 9, 5, 'Triangular Prism');
    } else {
      buildSquarePyramidWithNet(t);
      updateEulerInfo(5, 8, 5, 'Square-Based Pyramid');
    }
  }

  function updateEulerInfo(v, e, f, name) {
    const el = document.getElementById('eulerReadout');
    if (el) {
      el.innerHTML = `<strong>${name}</strong>: Vertices (V) = <span style="color:#38bdf8">${v}</span>, Edges (E) = <span style="color:#f59e0b">${e}</span>, Faces (F) = <span style="color:#10b981">${f}</span> | Euler's Formula: <strong>${v} - ${e} + ${f} = ${v - e + f}</strong>`;
    }
  }

  function buildTetrahedronWithNet(t) {
    const s = 2.4;
    const hBase = s * Math.sqrt(3) / 2;
    const rIn = hBase / 3;
    const rOut = 2 * hBase / 3;
    const hTetra = s * Math.sqrt(2 / 3);

    // Base equilateral triangle centered at (0, 0, 0)
    // Vertices at 90 deg (+Z), 210 deg, and 330 deg
    const B0 = new THREE.Vector3(0, 0, rOut);
    const B1 = new THREE.Vector3(-s / 2, 0, -rIn);
    const B2 = new THREE.Vector3(s / 2, 0, -rIn);

    const baseGeo = new THREE.BufferGeometry().setFromPoints([B0, B1, B2]);
    baseGeo.computeVertexNormals();
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide,
      wireframe: wireframeMode,
      transparent: true,
      opacity: wireframeMode ? 0.9 : 0.85
    });
    polyMeshGroup.add(new THREE.Mesh(baseGeo, baseMat));

    const baseEdgeGeo = new THREE.BufferGeometry().setFromPoints([B0, B1, B2, B0]);
    polyMeshGroup.add(new THREE.Line(baseEdgeGeo, new THREE.LineBasicMaterial({ color: 0x93c5fd, linewidth: 2 })));

    // Closed fold angle = acos(-1/3) = 109.471 deg
    // At t=0: closed pyramid (theta = acos(-1/3))
    // At t=1: flat net (theta = 0)
    const thetaClosed = Math.acos(-1 / 3);
    const theta = (1 - t) * thetaClosed;

    const colors = [0x10b981, 0xf59e0b, 0x8b5cf6];

    for (let k = 0; k < 3; k++) {
      const rotY = k * (2 * Math.PI / 3);
      const faceGroup = new THREE.Group();
      faceGroup.rotation.y = rotY;
      polyMeshGroup.add(faceGroup);

      const pivot = new THREE.Group();
      pivot.position.set(0, 0, -rIn);
      faceGroup.add(pivot);

      const pLeft = new THREE.Vector3(-s / 2, 0, 0);
      const pRight = new THREE.Vector3(s / 2, 0, 0);
      const apex = new THREE.Vector3(0, hBase * Math.sin(theta), -hBase * Math.cos(theta));

      const faceGeo = new THREE.BufferGeometry().setFromPoints([pLeft, pRight, apex]);
      faceGeo.computeVertexNormals();
      const faceMesh = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({
        color: colors[k],
        roughness: 0.3,
        side: THREE.DoubleSide,
        wireframe: wireframeMode,
        transparent: true,
        opacity: wireframeMode ? 0.9 : 0.85
      }));
      pivot.add(faceMesh);

      // Edge outline
      const edgeGeo = new THREE.BufferGeometry().setFromPoints([pLeft, pRight, apex, pLeft]);
      pivot.add(new THREE.Line(edgeGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })));
    }

    // Altitude indicator when folded
    if (showAltitude && t < 0.25) {
      const apex3D = new THREE.Vector3(0, hTetra, 0);
      const centroidBase = new THREE.Vector3(0, 0, 0);
      const altGeo = new THREE.BufferGeometry().setFromPoints([apex3D, centroidBase]);
      const altLine = new THREE.Line(altGeo, new THREE.LineDashedMaterial({
        color: 0xef4444,
        dashSize: 0.1,
        gapSize: 0.05,
        linewidth: 4
      }));
      altLine.computeLineDistances();
      polyMeshGroup.add(altLine);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      sphere.position.copy(apex3D);
      polyMeshGroup.add(sphere);

      const cMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      cMarker.position.copy(centroidBase);
      polyMeshGroup.add(cMarker);
    }
  }

  function buildTriangularPrismWithNet(t) {
    const s = 2.0;
    const hBase = s * Math.sqrt(3) / 2;
    const length = 2.8;

    const halfS = s / 2;
    const halfL = length / 2;

    // Center base rectangle
    const baseGeo = new THREE.PlaneGeometry(s, length);
    baseGeo.rotateX(-Math.PI / 2);
    polyMeshGroup.add(new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    })));

    const baseEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, -halfL),
      new THREE.Vector3(halfS, 0, -halfL),
      new THREE.Vector3(halfS, 0, halfL),
      new THREE.Vector3(-halfS, 0, halfL),
      new THREE.Vector3(-halfS, 0, -halfL)
    ]);
    polyMeshGroup.add(new THREE.Line(baseEdgeGeo, new THREE.LineBasicMaterial({ color: 0x93c5fd, linewidth: 2 })));

    // Left face: hinged at X = -halfS
    const alpha = Math.PI - (1 - t) * (2 * Math.PI / 3);
    const leftOuterX = -halfS + s * Math.cos(alpha);
    const leftOuterY = s * Math.sin(alpha);

    const leftGeo = new THREE.BufferGeometry();
    const leftVerts = new Float32Array([
      -halfS, 0, -halfL,   leftOuterX, leftOuterY, -halfL,   leftOuterX, leftOuterY, halfL,
      -halfS, 0, -halfL,   leftOuterX, leftOuterY, halfL,    -halfS, 0, halfL
    ]);
    leftGeo.setAttribute('position', new THREE.BufferAttribute(leftVerts, 3));
    leftGeo.computeVertexNormals();
    polyMeshGroup.add(new THREE.Mesh(leftGeo, new THREE.MeshStandardMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    })));
    const leftEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, -halfL),
      new THREE.Vector3(leftOuterX, leftOuterY, -halfL),
      new THREE.Vector3(leftOuterX, leftOuterY, halfL),
      new THREE.Vector3(-halfS, 0, halfL),
      new THREE.Vector3(-halfS, 0, -halfL)
    ]);
    polyMeshGroup.add(new THREE.Line(leftEdgeGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })));

    // Right face: hinged at X = +halfS
    const beta = (1 - t) * (2 * Math.PI / 3);
    const rightFinalX = halfS + s * Math.cos(beta);
    const rightOuterY = s * Math.sin(beta);

    const rightGeo = new THREE.BufferGeometry();
    const rightVerts = new Float32Array([
      halfS, 0, -halfL,   rightFinalX, rightOuterY, -halfL,   rightFinalX, rightOuterY, halfL,
      halfS, 0, -halfL,   rightFinalX, rightOuterY, halfL,    halfS, 0, halfL
    ]);
    rightGeo.setAttribute('position', new THREE.BufferAttribute(rightVerts, 3));
    rightGeo.computeVertexNormals();
    polyMeshGroup.add(new THREE.Mesh(rightGeo, new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    })));
    const rightEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(halfS, 0, -halfL),
      new THREE.Vector3(rightFinalX, rightOuterY, -halfL),
      new THREE.Vector3(rightFinalX, rightOuterY, halfL),
      new THREE.Vector3(halfS, 0, halfL),
      new THREE.Vector3(halfS, 0, -halfL)
    ]);
    polyMeshGroup.add(new THREE.Line(rightEdgeGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })));

    // Front & Back triangles
    const gamma = (1 - t) * (Math.PI / 2);
    const frontApexY = hBase * Math.sin(gamma);
    const frontApexZ = halfL + hBase * Math.cos(gamma);

    const frontGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, halfL),
      new THREE.Vector3(halfS, 0, halfL),
      new THREE.Vector3(0, frontApexY, frontApexZ)
    ]);
    frontGeo.computeVertexNormals();
    polyMeshGroup.add(new THREE.Mesh(frontGeo, new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    })));
    const frontEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, halfL),
      new THREE.Vector3(halfS, 0, halfL),
      new THREE.Vector3(0, frontApexY, frontApexZ),
      new THREE.Vector3(-halfS, 0, halfL)
    ]);
    polyMeshGroup.add(new THREE.Line(frontEdgeGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })));

    const backApexY = hBase * Math.sin(gamma);
    const backApexZ = -halfL - hBase * Math.cos(gamma);

    const backGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, -halfL),
      new THREE.Vector3(halfS, 0, -halfL),
      new THREE.Vector3(0, backApexY, backApexZ)
    ]);
    backGeo.computeVertexNormals();
    polyMeshGroup.add(new THREE.Mesh(backGeo, new THREE.MeshStandardMaterial({
      color: 0xec4899,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    })));
    const backEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, -halfL),
      new THREE.Vector3(halfS, 0, -halfL),
      new THREE.Vector3(0, backApexY, backApexZ),
      new THREE.Vector3(-halfS, 0, -halfL)
    ]);
    polyMeshGroup.add(new THREE.Line(backEdgeGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })));
  }

  function buildSquarePyramidWithNet(t) {
    const s = 2.2;
    const h = 2.0;
    const halfS = s / 2;
    const slantH = Math.sqrt(h * h + halfS * halfS);
    const thetaClosed = Math.acos(-halfS / slantH);
    const theta = (1 - t) * thetaClosed;

    // Base square centered at origin on Y=0
    const baseGeo = new THREE.PlaneGeometry(s, s);
    baseGeo.rotateX(-Math.PI / 2);
    polyMeshGroup.add(new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      side: THREE.DoubleSide,
      wireframe: wireframeMode
    })));

    const baseEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfS, 0, -halfS),
      new THREE.Vector3(halfS, 0, -halfS),
      new THREE.Vector3(halfS, 0, halfS),
      new THREE.Vector3(-halfS, 0, halfS),
      new THREE.Vector3(-halfS, 0, -halfS)
    ]);
    polyMeshGroup.add(new THREE.Line(baseEdgeGeo, new THREE.LineBasicMaterial({ color: 0x93c5fd, linewidth: 2 })));

    const colors = [0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];

    for (let k = 0; k < 4; k++) {
      const rotY = k * (Math.PI / 2);
      const sideGroup = new THREE.Group();
      sideGroup.rotation.y = rotY;
      polyMeshGroup.add(sideGroup);

      const pivot = new THREE.Group();
      pivot.position.set(0, 0, -halfS);
      sideGroup.add(pivot);

      const pLeft = new THREE.Vector3(-halfS, 0, 0);
      const pRight = new THREE.Vector3(halfS, 0, 0);
      const apex = new THREE.Vector3(0, slantH * Math.sin(theta), -slantH * Math.cos(theta));

      const triGeo = new THREE.BufferGeometry().setFromPoints([pLeft, pRight, apex]);
      triGeo.computeVertexNormals();
      pivot.add(new THREE.Mesh(triGeo, new THREE.MeshStandardMaterial({
        color: colors[k],
        side: THREE.DoubleSide,
        wireframe: wireframeMode,
        transparent: true,
        opacity: 0.85
      })));

      const edgeGeo = new THREE.BufferGeometry().setFromPoints([pLeft, pRight, apex, pLeft]);
      pivot.add(new THREE.Line(edgeGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })));
    }

    if (showAltitude && t < 0.25) {
      const apex3D = new THREE.Vector3(0, h, 0);
      const baseCenter = new THREE.Vector3(0, 0, 0);
      const altGeo = new THREE.BufferGeometry().setFromPoints([apex3D, baseCenter]);
      const altLine = new THREE.Line(altGeo, new THREE.LineDashedMaterial({
        color: 0xef4444,
        dashSize: 0.1,
        gapSize: 0.05,
        linewidth: 4
      }));
      altLine.computeLineDistances();
      polyMeshGroup.add(altLine);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      sphere.position.copy(apex3D);
      polyMeshGroup.add(sphere);
    }
  }

  function setupPolyControls() {
    const slider = document.getElementById('unfoldSlider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        unfoldProgress = Number(e.target.value) / 100;
        document.getElementById('unfoldValue').textContent = `${e.target.value}%`;
        buildPolyhedron();
      });
    }

    const select = document.getElementById('polyhedronSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        currentPolyType = e.target.value;
        buildPolyhedron();
      });
    }

    const altBtn = document.getElementById('toggleAltitudeBtn');
    if (altBtn) {
      altBtn.addEventListener('click', () => {
        showAltitude = !showAltitude;
        altBtn.classList.toggle('active', showAltitude);
        buildPolyhedron();
      });
    }

    const wireBtn = document.getElementById('toggleWireframeBtn');
    if (wireBtn) {
      wireBtn.addEventListener('click', () => {
        wireframeMode = !wireframeMode;
        wireBtn.classList.toggle('active', wireframeMode);
        buildPolyhedron();
      });
    }

    const rotBtn = document.getElementById('toggleRotateBtn');
    if (rotBtn) {
      rotBtn.addEventListener('click', () => {
        autoRotatePoly = !autoRotatePoly;
        rotBtn.classList.toggle('active', autoRotatePoly);
      });
    }
  }

  /* =========================================================================
     2. 3D Intersecting Lines & Exterior Angle Plane (Chapter 7)
     ========================================================================= */
  let planeScene, planeCamera, planeRenderer, planeOrbit;

  function initPlaneIntersectionLab() {
    const container = document.getElementById('plane-3d-canvas');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    planeScene = new THREE.Scene();
    planeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    planeCamera.position.set(3, 4, 6);

    planeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    planeRenderer.setSize(width, height);
    planeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(planeRenderer.domElement);

    planeOrbit = attachOrbitControls(planeCamera, planeRenderer.domElement, { radius: 7.5, theta: 0.6, phi: 1.0 });

    planeScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1);
    dirLight.position.set(5, 8, 5);
    planeScene.add(dirLight);

    const grid = new THREE.GridHelper(8, 16, 0x475569, 0x1e293b);
    planeScene.add(grid);

    const triGroup = new THREE.Group();
    planeScene.add(triGroup);

    const A = new THREE.Vector3(0, 2.5, 0.5);
    const B = new THREE.Vector3(-2.2, 0.4, 1.2);
    const C = new THREE.Vector3(1.8, 0.4, -0.8);
    const dirBC = new THREE.Vector3().subVectors(C, B).normalize();
    const D = new THREE.Vector3().addVectors(C, dirBC.clone().multiplyScalar(2.0));

    const triGeo = new THREE.BufferGeometry().setFromPoints([A, B, C]);
    triGeo.computeVertexNormals();
    triGroup.add(new THREE.Mesh(triGeo, new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    })));

    function createThickLine(p1, p2, color) {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, linewidth: 3 }));
    }

    const dirAB = new THREE.Vector3().subVectors(B, A).normalize();
    const extA1 = new THREE.Vector3().subVectors(A, dirAB.clone().multiplyScalar(1.2));
    const extB1 = new THREE.Vector3().addVectors(B, dirAB.clone().multiplyScalar(1.2));
    triGroup.add(createThickLine(extA1, extB1, 0x10b981));

    const dirAC = new THREE.Vector3().subVectors(C, A).normalize();
    const extA2 = new THREE.Vector3().subVectors(A, dirAC.clone().multiplyScalar(1.2));
    const extC2 = new THREE.Vector3().addVectors(C, dirAC.clone().multiplyScalar(1.2));
    triGroup.add(createThickLine(extA2, extC2, 0xf59e0b));

    const extB3 = new THREE.Vector3().subVectors(B, dirBC.clone().multiplyScalar(1.2));
    triGroup.add(createThickLine(extB3, D, 0xef4444));

    const rayGeo = new THREE.BufferGeometry().setFromPoints([C, D]);
    const rayLine = new THREE.Line(rayGeo, new THREE.LineDashedMaterial({ color: 0xec4899, dashSize: 0.2, gapSize: 0.1 }));
    rayLine.computeLineDistances();
    triGroup.add(rayLine);

    [
      { p: A, name: 'A', color: 0x3b82f6 },
      { p: B, name: 'B', color: 0x10b981 },
      { p: C, name: 'C', color: 0xf59e0b },
      { p: D, name: 'D (Ext)', color: 0xec4899 }
    ].forEach((item) => {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: item.color })
      );
      sphere.position.copy(item.p);
      triGroup.add(sphere);
    });

    const btn2D = document.getElementById('view2DPlaneBtn');
    if (btn2D) {
      btn2D.addEventListener('click', () => {
        if (planeOrbit) planeOrbit.setOrientation(0.001, 0.05, 7.5);
      });
    }

    const btn3D = document.getElementById('view3DPlaneBtn');
    if (btn3D) {
      btn3D.addEventListener('click', () => {
        if (planeOrbit) planeOrbit.setOrientation(0.6, 1.0, 7.5);
      });
    }

    function animatePlane() {
      requestAnimationFrame(animatePlane);
      planeRenderer.render(planeScene, planeCamera);
    }
    animatePlane();

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      planeCamera.aspect = w / h;
      planeCamera.updateProjectionMatrix();
      planeRenderer.setSize(w, h);
    });
  }

  /* =========================================================================
     3. 3D Fraction Voxel Cake Slicer (Chapter 8: Visual Multiplication & Volume)
     ========================================================================= */
  let fracScene, fracCamera, fracRenderer, fracOrbit, fracGroup;
  let fracDivX = 2, fracDivY = 3, fracDivZ = 2;
  let selX = 1, selY = 2, selZ = 1;
  let explodeDistance = 0.0;

  function initFraction3DVoxelLab() {
    const container = document.getElementById('fraction-3d-canvas');
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    fracScene = new THREE.Scene();
    fracCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    fracCamera.position.set(3.5, 3.2, 4.5);

    fracRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    fracRenderer.setSize(width, height);
    fracRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(fracRenderer.domElement);

    fracOrbit = attachOrbitControls(fracCamera, fracRenderer.domElement, { radius: 6.5, theta: 0.7, phi: 1.1 });

    fracScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    fracScene.add(dirLight);

    fracGroup = new THREE.Group();
    fracScene.add(fracGroup);

    rebuildFractionVoxels();
    setupFraction3DControls();

    function animateFrac() {
      requestAnimationFrame(animateFrac);
      if (fracOrbit) fracOrbit.rotateStep(0.003);
      fracRenderer.render(fracScene, fracCamera);
    }
    animateFrac();

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      fracCamera.aspect = w / h;
      fracCamera.updateProjectionMatrix();
      fracRenderer.setSize(w, h);
    });
  }

  function rebuildFractionVoxels() {
    while (fracGroup.children.length > 0) {
      fracGroup.remove(fracGroup.children[0]);
    }

    const totalWidth = 2.4;
    const totalHeight = 2.4;
    const totalDepth = 2.4;

    const voxelW = totalWidth / fracDivX;
    const voxelH = totalHeight / fracDivY;
    const voxelD = totalDepth / fracDivZ;

    const selectedMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });

    const unselectedMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22
    });

    let selectedCount = 0;
    const totalCount = fracDivX * fracDivY * fracDivZ;

    for (let x = 0; x < fracDivX; x++) {
      for (let y = 0; y < fracDivY; y++) {
        for (let z = 0; z < fracDivZ; z++) {
          const isSelected = (x < selX) && (y < selY) && (z < selZ);
          if (isSelected) selectedCount++;

          const geo = new THREE.BoxGeometry(voxelW * 0.94, voxelH * 0.94, voxelD * 0.94);
          const mesh = new THREE.Mesh(geo, isSelected ? selectedMat : unselectedMat);

          const offsetX = (x - (fracDivX - 1) / 2) * (voxelW + explodeDistance);
          const offsetY = (y - (fracDivY - 1) / 2) * (voxelH + explodeDistance);
          const offsetZ = (z - (fracDivZ - 1) / 2) * (voxelD + explodeDistance);

          mesh.position.set(offsetX, offsetY, offsetZ);

          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: isSelected ? 0x059669 : 0x64748b, linewidth: 1.5 })
          );
          mesh.add(edges);

          fracGroup.add(mesh);
        }
      }
    }

    const readout = document.getElementById('frac3DReadout');
    if (readout) {
      function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
      }
      const g = gcd(selectedCount, totalCount);
      const simpNum = selectedCount / g;
      const simpDen = totalCount / g;
      const simpText = g > 1 ? ` = ${simpNum}/${simpDen}` : '';

      readout.innerHTML = `
        <strong>Fraction of 3D Cake</strong>: 
        ( ${selX}/${fracDivX} ) &times; ( ${selY}/${fracDivY} ) &times; ( ${selZ}/${fracDivZ} ) = 
        <span style="color:#10b981; font-weight:800; font-size:1.1rem;">${selectedCount} / ${totalCount}${simpText}</span>
        <br><span style="color:#64748b; font-size:0.85rem;">${selectedCount} green glowing blocks out of ${totalCount} total cake slices.</span>
      `;
    }
  }

  function setupFraction3DControls() {
    ['X', 'Y', 'Z'].forEach((axis) => {
      const divInput = document.getElementById(`div${axis}`);
      const selInput = document.getElementById(`sel${axis}`);

      if (divInput && selInput) {
        divInput.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          if (axis === 'X') fracDivX = val;
          if (axis === 'Y') fracDivY = val;
          if (axis === 'Z') fracDivZ = val;

          selInput.max = val;
          if (Number(selInput.value) > val) selInput.value = val;
          if (axis === 'X') selX = Number(selInput.value);
          if (axis === 'Y') selY = Number(selInput.value);
          if (axis === 'Z') selZ = Number(selInput.value);

          document.getElementById(`div${axis}Val`).textContent = val;
          document.getElementById(`sel${axis}Val`).textContent = selInput.value;
          rebuildFractionVoxels();
        });

        selInput.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          if (axis === 'X') selX = val;
          if (axis === 'Y') selY = val;
          if (axis === 'Z') selZ = val;

          document.getElementById(`sel${axis}Val`).textContent = val;
          rebuildFractionVoxels();
        });
      }
    });

    const explodeSlider = document.getElementById('fracExplodeSlider');
    if (explodeSlider) {
      explodeSlider.addEventListener('input', (e) => {
        explodeDistance = Number(e.target.value) / 100 * 0.8;
        rebuildFractionVoxels();
      });
    }
  }

  function handleResizeAll3D() {
    const polyCont = document.getElementById('polyhedra-3d-canvas');
    if (polyCont && polyRenderer && polyCamera) {
      const w = polyCont.clientWidth;
      const h = polyCont.clientHeight;
      if (w > 0 && h > 0) {
        polyCamera.aspect = w / h;
        polyCamera.updateProjectionMatrix();
        polyRenderer.setSize(w, h);
      }
    }

    const planeCont = document.getElementById('plane-3d-canvas');
    if (planeCont && planeRenderer && planeCamera) {
      const w = planeCont.clientWidth;
      const h = planeCont.clientHeight;
      if (w > 0 && h > 0) {
        planeCamera.aspect = w / h;
        planeCamera.updateProjectionMatrix();
        planeRenderer.setSize(w, h);
      }
    }

    const fracCont = document.getElementById('fraction-3d-canvas');
    if (fracCont && fracRenderer && fracCamera) {
      const w = fracCont.clientWidth;
      const h = fracCont.clientHeight;
      if (w > 0 && h > 0) {
        fracCamera.aspect = w / h;
        fracCamera.updateProjectionMatrix();
        fracRenderer.setSize(w, h);
      }
    }
  }

  // Hook into tab switches and window resize
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      setTimeout(handleResizeAll3D, 80);
      setTimeout(handleResizeAll3D, 250);
    });
  });
  window.addEventListener('resize', handleResizeAll3D);

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
})();
