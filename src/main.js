import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const canvas = document.querySelector('#game');
const statusEl = document.querySelector('#status');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#8ec5ff');
scene.fog = new THREE.Fog('#8ec5ff', 22, 90);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 8, 16);

const hemiLight = new THREE.HemisphereLight('#dff3ff', '#2a2f2a', 0.9);
scene.add(hemiLight);

const sun = new THREE.DirectionalLight('#fff5dd', 1.15);
sun.position.set(14, 24, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
scene.add(sun);

const terrain = new THREE.Mesh(
  new THREE.PlaneGeometry(160, 160, 90, 90),
  new THREE.MeshStandardMaterial({ color: '#4a8c3f', roughness: 1 })
);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
const pos = terrain.geometry.attributes.position;
for (let i = 0; i < pos.count; i += 1) {
  const x = pos.getX(i);
  const z = pos.getY(i);
  const h = Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.9;
  pos.setZ(i, h);
}
terrain.geometry.computeVertexNormals();
scene.add(terrain);

const stable = new THREE.Group();
stable.position.set(26, 0, -22);
const barnBody = new THREE.Mesh(
  new THREE.BoxGeometry(8, 4.5, 8),
  new THREE.MeshStandardMaterial({ color: '#7a3422' })
);
barnBody.position.y = 2.25;
barnBody.castShadow = true;
barnBody.receiveShadow = true;
const barnRoof = new THREE.Mesh(
  new THREE.ConeGeometry(6.1, 3.5, 4),
  new THREE.MeshStandardMaterial({ color: '#4f2a1c' })
);
barnRoof.position.y = 6;
barnRoof.rotation.y = Math.PI / 4;
barnRoof.castShadow = true;
stable.add(barnBody, barnRoof);
scene.add(stable);

function createTree(x, z) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.65, 3.5, 10),
    new THREE.MeshStandardMaterial({ color: '#6f4729' })
  );
  trunk.position.y = 1.7;
  trunk.castShadow = true;
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#2e6e2f' })
  );
  crown.position.y = 4.7;
  crown.castShadow = true;
  crown.receiveShadow = true;
  tree.position.set(x, 0, z);
  tree.add(trunk, crown);
  scene.add(tree);
}

for (let i = 0; i < 24; i += 1) {
  const angle = (i / 24) * Math.PI * 2;
  createTree(Math.cos(angle) * 42 + Math.sin(i) * 4, Math.sin(angle) * 42 + Math.cos(i) * 4);
}

function createHorse() {
  const horse = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.4, 1.1),
    new THREE.MeshStandardMaterial({ color: '#593525', roughness: 0.75 })
  );
  body.position.y = 2.3;

  const neck = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.2, 0.8),
    body.material
  );
  neck.position.set(1.1, 3, 0);
  neck.rotation.z = -0.35;

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.7, 0.65),
    body.material
  );
  head.position.set(1.95, 3.22, 0);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: '#231812' })
  );
  tail.position.set(-1.5, 2.7, 0);
  tail.rotation.z = Math.PI * 0.76;

  const mane = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.9, 0.7),
    new THREE.MeshStandardMaterial({ color: '#1f130f' })
  );
  mane.position.set(1.3, 3.35, 0);

  horse.add(body, neck, head, tail, mane);

  const legPositions = [
    [-0.95, 1.1, 0.4],
    [-0.95, 1.1, -0.4],
    [0.95, 1.1, 0.4],
    [0.95, 1.1, -0.4],
  ];

  const legs = legPositions.map(([x, y, z], index) => {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.8, 0.35),
      body.material
    );
    leg.position.set(x, y, z);
    leg.userData.phase = index % 2 === 0 ? 0 : Math.PI;
    horse.add(leg);
    return leg;
  });

  horse.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return { horse, legs };
}

const { horse, legs } = createHorse();
horse.position.y = 0.1;
scene.add(horse);

const apples = [];
for (let i = 0; i < 7; i += 1) {
  const apple = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#d1372f', emissive: '#2f0807', emissiveIntensity: 0.25 })
  );
  apple.position.set((Math.random() - 0.5) * 46, 1.05, (Math.random() - 0.5) * 46);
  apple.castShadow = true;
  apples.push(apple);
  scene.add(apple);
}

const keys = new Set();
window.addEventListener('keydown', (event) => keys.add(event.key.toLowerCase()));
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

let applesCollected = 0;
let completed = false;
const player = {
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  speed: 8,
};

const clock = new THREE.Clock();

function updateStatus() {
  if (completed) {
    statusEl.textContent = `Mission complete! You delivered your horse safely. Apples: ${applesCollected}/${apples.length}`;
    return;
  }
  statusEl.textContent = `Apples: ${applesCollected}/${apples.length} • Reach the stable once all apples are collected.`;
}
updateStatus();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const sprint = keys.has('shift') ? 1.45 : 1;

  player.direction.set(0, 0, 0);
  if (keys.has('w') || keys.has('arrowup')) player.direction.z -= 1;
  if (keys.has('s') || keys.has('arrowdown')) player.direction.z += 1;
  if (keys.has('a') || keys.has('arrowleft')) player.direction.x -= 1;
  if (keys.has('d') || keys.has('arrowright')) player.direction.x += 1;
  player.direction.normalize();

  const targetSpeed = player.speed * sprint;
  player.velocity.x = THREE.MathUtils.damp(player.velocity.x, player.direction.x * targetSpeed, 7, dt);
  player.velocity.z = THREE.MathUtils.damp(player.velocity.z, player.direction.z * targetSpeed, 7, dt);
  horse.position.x += player.velocity.x * dt;
  horse.position.z += player.velocity.z * dt;

  horse.position.x = THREE.MathUtils.clamp(horse.position.x, -58, 58);
  horse.position.z = THREE.MathUtils.clamp(horse.position.z, -58, 58);

  const moving = player.direction.lengthSq() > 0.01;
  if (moving) {
    const heading = Math.atan2(player.velocity.x, player.velocity.z);
    horse.rotation.y = THREE.MathUtils.lerp(horse.rotation.y, heading, dt * 10);
  }

  const trot = (Math.abs(player.velocity.x) + Math.abs(player.velocity.z)) * 0.18;
  legs.forEach((leg) => {
    leg.rotation.x = Math.sin(clock.elapsedTime * 11 + leg.userData.phase) * trot;
  });

  apples.forEach((apple) => {
    if (!apple.visible) return;
    apple.position.y = 1 + Math.sin(clock.elapsedTime * 2 + apple.position.x) * 0.15;
    apple.rotation.y += dt * 1.5;
    if (horse.position.distanceTo(apple.position) < 1.4) {
      apple.visible = false;
      applesCollected += 1;
      updateStatus();
    }
  });

  if (!completed && applesCollected === apples.length && horse.position.distanceTo(stable.position) < 5.5) {
    completed = true;
    updateStatus();
  }

  const camTarget = new THREE.Vector3(
    horse.position.x + Math.sin(horse.rotation.y) * 8,
    6,
    horse.position.z + Math.cos(horse.rotation.y) * 8
  );
  camera.position.lerp(camTarget, dt * 3.5);
  camera.lookAt(horse.position.x, 2.4, horse.position.z);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
