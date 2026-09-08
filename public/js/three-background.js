/* Фоновая wireframe-анимация — медленно вращающаяся икосфера, тонкие
 * линии цвета акцент-2 (LCD-голубой), живёт на fixed canvas за всем
 * контентом (низкая непрозрачность — фон, не солист, солист — hero,
 * см. three-hero.js). Останавливается при prefers-reduced-motion, на
 * скрытой вкладке и упрощается (без анимации) на мобильных. */
import * as THREE from '/js/vendor/three.module.js';

function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.WebGLRenderingContext) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.IcosahedronGeometry(4.2, isMobile ? 1 : 2);
  const wireframe = new THREE.WireframeGeometry(geometry);
  const material = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.15,
  });
  const mesh = new THREE.LineSegments(wireframe, material);
  scene.add(mesh);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  if (prefersReducedMotion || isMobile) {
    mesh.rotation.set(0.3, 0.5, 0);
    renderer.render(scene, camera);
    return;
  }

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) requestAnimationFrame(animate);
  });

  function animate() {
    if (!running) return;
    mesh.rotation.y += 0.0007;
    mesh.rotation.x += 0.0003;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

if (document.readyState !== 'loading') initBackground();
else document.addEventListener('DOMContentLoaded', initBackground);
