// Hero backdrop: an ETL pipeline running over a rippling data floor.
// Source databases (extract) → spinning transform node → warehouse (load) → live bar chart (report).
// Packets travel the pipes grey while raw and turn teal once transformed.
// Positions are placed so each stage lands in an open area of the hero at desktop sizes.
// Loaded as a classic script with a dynamic import() rather than <script type="module">:
// browsers block local module files when index.html is opened straight from disk (file://).
(async () => {
    const hero = document.querySelector('.hero');
    const canvas = document.getElementById('hero-canvas');
    const ACCENT = 0x45d0b0;
    const RAW = 0x8d969e;

    try {
        const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0c0e, 24, 72);

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
        const BASE = new THREE.Vector3(0, 14, 20);
        const LOOK = new THREE.Vector3(0, 0, -2);
        camera.position.copy(BASE);

        // --- Data floor: points rippling like a surface plot ---
        const COLS = window.innerWidth < 768 ? 60 : 110;
        const ROWS = 70;
        const GAP = 0.6;
        const floor = new Float32Array(COLS * ROWS * 3);
        for (let i = 0; i < COLS; i++) {
            for (let j = 0; j < ROWS; j++) {
                const k = (i * ROWS + j) * 3;
                floor[k] = (i - COLS / 2) * GAP;
                floor[k + 2] = (j - ROWS / 2) * GAP - 8;
            }
        }
        const floorGeometry = new THREE.BufferGeometry();
        floorGeometry.setAttribute('position', new THREE.BufferAttribute(floor, 3));
        scene.add(new THREE.Points(floorGeometry, new THREE.PointsMaterial({
            color: ACCENT, size: 0.07, transparent: true, opacity: 0.35, depthWrite: false
        })));

        // --- Pipeline ---
        const pipeline = new THREE.Group();
        scene.add(pipeline);

        const lineMaterial = (color, opacity) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
        const outline = (geometry, material) => new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 15), material);
        const rawLine = lineMaterial(RAW, 0.45);
        const accentLine = lineMaterial(ACCENT, 0.7);

        // A database icon: a cylinder outline with four bands and two side walls
        const database = (position, radius, height, material) => {
            const points = [];
            const SEGMENTS = 40;
            for (let band = 0; band < 4; band++) {
                const y = (height * band) / 3;
                for (let s = 0; s < SEGMENTS; s++) {
                    const a0 = (s / SEGMENTS) * Math.PI * 2;
                    const a1 = ((s + 1) / SEGMENTS) * Math.PI * 2;
                    points.push(new THREE.Vector3(Math.cos(a0) * radius, y, Math.sin(a0) * radius),
                        new THREE.Vector3(Math.cos(a1) * radius, y, Math.sin(a1) * radius));
                }
            }
            for (const x of [-radius, radius]) points.push(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, height, 0));
            const db = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), material);
            db.position.copy(position);
            pipeline.add(db);
        };

        const SOURCES = [new THREE.Vector3(-19, 0.5, -20), new THREE.Vector3(-12, 0.5, -24), new THREE.Vector3(-5, 0.5, -19)];
        const HUB = new THREE.Vector3(3, 3, -16);
        const WAREHOUSE = new THREE.Vector3(16.5, 0.5, -8);
        const REPORT = new THREE.Vector3(-2.4, 0.4, 9);

        SOURCES.forEach((p) => database(p, 0.9, 1.5, rawLine));
        database(WAREHOUSE, 1.25, 2.2, lineMaterial(ACCENT, 0.55));

        // Transform node: two counter-rotating polyhedra
        const hubOuter = outline(new THREE.IcosahedronGeometry(1.7, 0), lineMaterial(ACCENT, 0.85));
        const hubInner = outline(new THREE.OctahedronGeometry(0.8, 0), lineMaterial(0xffffff, 0.6));
        hubOuter.position.copy(HUB);
        hubInner.position.copy(HUB);
        pipeline.add(hubOuter, hubInner);

        // Report: bar chart whose bars ease to new values every refresh, with a trend line over the tops
        const BAR_COUNT = 7;
        const BAR_STEP = 0.75;
        const barGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        barGeometry.translate(0, 0.5, 0);
        const barFill = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.14, depthWrite: false });
        const barEdges = new THREE.EdgesGeometry(barGeometry);
        const bars = [];
        for (let i = 0; i < BAR_COUNT; i++) {
            const bar = new THREE.Group();
            bar.add(new THREE.Mesh(barGeometry, barFill), new THREE.LineSegments(barEdges, accentLine));
            bar.position.set(REPORT.x + i * BAR_STEP, REPORT.y, REPORT.z);
            bar.userData = { height: 0.6, target: 0.6 };
            pipeline.add(bar);
            bars.push(bar);
        }
        const trendPositions = new Float32Array(BAR_COUNT * 3);
        const trendGeometry = new THREE.BufferGeometry();
        trendGeometry.setAttribute('position', new THREE.BufferAttribute(trendPositions, 3));
        pipeline.add(new THREE.Line(trendGeometry, lineMaterial(0xffffff, 0.55)));
        const reportTop = REPORT.clone().add(new THREE.Vector3((BAR_COUNT - 1) * BAR_STEP / 2, 2.2, 0));

        // Pipes: arcs between stages
        const arc = (from, to, lift) => {
            const control = from.clone().lerp(to, 0.5);
            control.y += lift;
            return new THREE.QuadraticBezierCurve3(from.clone(), control, to.clone());
        };
        const routes = [
            ...SOURCES.map((s) => ({ curve: arc(s.clone().setY(1.8), HUB, 5), color: RAW, packets: 9 })),
            { curve: arc(HUB, WAREHOUSE.clone().setY(3), 5), color: ACCENT, packets: 16 },
            { curve: arc(WAREHOUSE.clone().setY(1), reportTop, 4), color: ACCENT, packets: 14 },
        ];
        routes.forEach(({ curve, color }) => {
            const pipe = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
            pipeline.add(new THREE.Line(pipe, lineMaterial(color, 0.16)));
        });

        // Packets: soft round sprites riding the pipes
        const dot = document.createElement('canvas');
        dot.width = dot.height = 64;
        const ctx = dot.getContext('2d');
        const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        glow.addColorStop(0, 'rgba(255,255,255,1)');
        glow.addColorStop(0.3, 'rgba(255,255,255,0.55)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 64, 64);

        const packets = routes.flatMap((route) => Array.from({ length: route.packets }, (_, i) => ({
            route, phase: i / route.packets + Math.random() * 0.05, speed: 0.08 + Math.random() * 0.05
        })));
        const packetPositions = new Float32Array(packets.length * 3);
        const packetColors = new Float32Array(packets.length * 3);
        packets.forEach((p, i) => new THREE.Color(p.route.color).toArray(packetColors, i * 3));
        const packetGeometry = new THREE.BufferGeometry();
        packetGeometry.setAttribute('position', new THREE.BufferAttribute(packetPositions, 3));
        packetGeometry.setAttribute('color', new THREE.BufferAttribute(packetColors, 3));
        pipeline.add(new THREE.Points(packetGeometry, new THREE.PointsMaterial({
            size: 0.42, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true,
            depthWrite: false, blending: THREE.AdditiveBlending
        })));

        // --- Animation ---
        const pointer = { x: 0, y: 0 };
        window.addEventListener('pointermove', (e) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });

        const tmp = new THREE.Vector3();
        let nextRefresh = 0;
        let last = 0;

        const render = (ms = 0) => {
            const t = ms / 1000;
            const dt = Math.min(t - last, 0.1);
            last = t;

            for (let k = 0; k < floor.length; k += 3) {
                floor[k + 1] = Math.sin(floor[k] * 0.22 + t * 0.4) * 0.6 + Math.cos(floor[k + 2] * 0.28 + t * 0.32) * 0.45 - 0.6;
            }
            floorGeometry.attributes.position.needsUpdate = true;

            hubOuter.rotation.set(t * 0.3, t * 0.45, 0);
            hubInner.rotation.set(-t * 0.5, -t * 0.35, 0);

            packets.forEach((p, i) => {
                p.route.curve.getPointAt((p.phase + t * p.speed) % 1, tmp).toArray(packetPositions, i * 3);
            });
            packetGeometry.attributes.position.needsUpdate = true;

            // "Report refresh": new values every few seconds, bars ease toward them
            if (t > nextRefresh) {
                bars.forEach((bar) => { bar.userData.target = 0.4 + Math.random() * 1.8; });
                nextRefresh = t + 2.6;
            }
            bars.forEach((bar, i) => {
                const d = bar.userData;
                d.height += (d.target - d.height) * (1 - Math.exp(-dt * 3));
                bar.scale.y = d.height;
                trendPositions.set([bar.position.x, REPORT.y + d.height + 0.25, bar.position.z], i * 3);
            });
            trendGeometry.attributes.position.needsUpdate = true;

            // Gentle parallax toward the pointer
            camera.position.x += (BASE.x + pointer.x * 2.5 - camera.position.x) * 0.03;
            camera.position.y += (BASE.y - pointer.y * 1.2 - camera.position.y) * 0.03;
            camera.lookAt(LOOK);
            renderer.render(scene, camera);
        };

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        new ResizeObserver(() => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            // Tall, narrow screens stack text over the portrait, leaving no open areas for the
            // pipeline stages, so only the data floor is shown there.
            pipeline.visible = camera.aspect >= 0.9;
            if (reducedMotion) render(4000);
        }).observe(canvas);

        // Only animate while the hero is on screen
        if (!reducedMotion) {
            new IntersectionObserver(([entry]) => {
                renderer.setAnimationLoop(entry.isIntersecting ? render : null);
            }).observe(hero);
        }
    } catch {
        canvas.remove(); // No WebGL or CDN unreachable: the page works fine without the backdrop
    }
})();
