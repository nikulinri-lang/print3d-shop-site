/* Hero-сцена — центральный "печатаемый объект": wireframe-икосаэдр
 * (оранжевый, светится через bloom) в облаке частиц, реагирует на
 * движение мыши лёгким параллаксом. Пока нет .glb товаров — заглушка
 * геометрией, а не выдуманным товаром; loadProductModel() ниже готов
 * подставить реальную модель, когда она появится (см. data-model-url
 * на .hero-visual).
 *
 * На мобильных (<768px) и при prefers-reduced-motion — упрощается до
 * статичного (без анимации) wireframe без частиц и без bloom-прохода:
 * тяжёлый постпроцессинг на слабых/маленьких экранах того не стоит. */
import * as THREE from '/js/vendor/three.module.js';
import { GLTFLoader } from '/js/vendor/three-jsm/loaders/GLTFLoader.js';
import { EffectComposer } from '/js/vendor/three-jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/js/vendor/three-jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/js/vendor/three-jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '/js/vendor/three-jsm/postprocessing/OutputPass.js';

function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const heroVisual = document.querySelector('.hero-visual');
  if (!canvas || !heroVisual || !window.WebGLRenderingContext) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const simplified = prefersReducedMotion || isMobile;

  function size() {
    return { w: heroVisual.clientWidth, h: heroVisual.clientHeight };
  }

  const scene = new THREE.Scene();
  const { w, h } = size();
  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, simplified ? 1.5 : 2));
  renderer.setSize(w, h);

  const group = new THREE.Group();
  scene.add(group);

  const geo = new THREE.IcosahedronGeometry(2.1, simplified ? 1 : 2);
  const wireMat = new THREE.LineBasicMaterial({ color: 0xff6b00, transparent: true, opacity: 0.85 });
  const wireMesh = new THREE.LineSegments(new THREE.WireframeGeometry(geo), wireMat);
  group.add(wireMesh);

  const solidMat = new THREE.MeshBasicMaterial({ color: 0xff6b00, transparent: true, opacity: 0.05 });
  const solidMesh = new THREE.Mesh(geo, solidMat);
  group.add(solidMesh);

  let particles = null;
  if (!simplified) {
    const count = 700;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
  }

  let composer = null;
  if (!simplified) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.9, 0.4, 0.15);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  function onResize() {
    const { w, h } = size();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  if (simplified) {
    group.rotation.set(0.3, 0.6, 0);
    renderer.render(scene, camera);
    return;
  }

  // Параллакс за курсором — цель, к которой плавно (lerp) едет группа,
  // а не мгновенный "прилипший" поворот.
  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) requestAnimationFrame(animate);
  });

  const timer = new THREE.Timer();

  function animate() {
    if (!running) return;
    timer.update();
    const t = timer.getElapsed();

    group.rotation.y += (targetX * 0.4 - group.rotation.y) * 0.04 + 0.0015;
    group.rotation.x += (targetY * 0.25 - group.rotation.x) * 0.04;

    if (particles) particles.rotation.y = t * 0.02;

    composer.render();
    requestAnimationFrame(animate);
  }
  animate();

  // Готово к реальной модели: <div class="hero-visual" data-model-url="/models/xxx.glb">
  const modelUrl = heroVisual.dataset.modelUrl;
  if (modelUrl) {
    new GLTFLoader().load(
      modelUrl,
      (gltf) => {
        group.remove(wireMesh, solidMesh);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        const scale = 3.4 / Math.max(sizeVec.x, sizeVec.y, sizeVec.z, 0.001);
        gltf.scene.scale.setScalar(scale);
        box.setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        gltf.scene.position.sub(center);
        group.add(gltf.scene);
      },
      undefined,
      (err) => console.warn('[three-hero] не удалось загрузить модель товара:', err)
    );
  }
}

if (document.readyState !== 'loading') initHero();
else document.addEventListener('DOMContentLoaded', initHero);
