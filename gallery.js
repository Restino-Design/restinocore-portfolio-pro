// 3D model gallery — three.js viewer with orbit controls, studio lighting and
// a swipeable carousel covering the full high-poly collection. Everything
// (three.js core + the first model) loads right away on page load — we used
// to gate this behind an IntersectionObserver so it would only load once the
// section neared the viewport, but that proved unreliable in some tabs/
// environments (intersection callbacks can stall for a backgrounded tab),
// leaving the viewer stuck on its loading state. Booting immediately trades
// a bit of upfront load for a viewer that reliably works. Only the model
// the visitor actually selects gets fetched — the other 21 stay untouched
// until clicked, so the carousel itself stays cheap regardless of size.
(function () {
  var section = document.getElementById('gallery3d');
  if (!section) return;

  // ---- Curated collection: every high-poly piece from the two bundles ----
  // Weapon names (Katana, Tsurugi, Shuriken...) are loanwords — same in both
  // languages, so only `titleEn`/`titlePt` for the tool pieces actually differ.
  var MODELS = [
    { key: 'skull', titleEn: 'Experimental Skull', titlePt: 'Crânio Experimental', tagEn: 'Anatomical Study', tagPt: 'Estudo Anatômico', descEn: 'An anatomical piece modeled with focus on organic form and structural accuracy of the bone surfaces.', descPt: 'Peça anatômica modelada com foco em forma orgânica e fidelidade estrutural das superfícies ósseas.' },
    { key: 'katana', titleEn: 'Katana', titlePt: 'Katana', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A sword modeled with focus on blade proportion and silhouette readability from any angle.', descPt: 'Espada modelada com foco em proporção de lâmina e leitura de silhueta em qualquer ângulo.' },
    { key: 'tsurugi', titleEn: 'Tsurugi', titlePt: 'Tsurugi', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A straight double-edged sword, focused on symmetry and a polished metal finish.', descPt: 'Espada reta de dupla lâmina, com foco em simetria e acabamento metálico polido.' },
    { key: 'naginata', titleEn: 'Naginata', titlePt: 'Naginata', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A long-shafted weapon with an organic curve in the blade — a topology challenge that had to avoid distorting the texture.', descPt: 'Arma de haste longa com curvatura orgânica na lâmina — desafio de topologia sem distorcer a textura.' },
    { key: 'kama', titleEn: 'Kama', titlePt: 'Kama', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A traditional sickle with compact geometry, balancing visual weight against mesh lightness.', descPt: 'Foice tradicional com geometria compacta, equilibrando peso visual e leveza da malha.' },
    { key: 'kunai', titleEn: 'Kunai', titlePt: 'Kunai', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A throwing dagger emphasizing crisp, well-defined cutting edges and fast shape readability.', descPt: 'Adaga de arremesso com ênfase em bordas cortantes bem definidas e leitura de forma rápida.' },
    { key: 'nunchaku', titleEn: 'Nunchaku', titlePt: 'Nunchaku', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A pair of articulated sticks, designed with functional rigging between the pieces in mind.', descPt: 'Par de bastões articulados, pensado com potencial para rigging funcional entre as peças.' },
    { key: 'fukiya', titleEn: 'Fukiya', titlePt: 'Fukiya', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A traditional blowgun modeled with focus on a long silhouette and proportions faithful to the reference.', descPt: 'Zarabatana tradicional modelada com foco em silhueta longa e proporção fiel à referência.' },
    { key: 'dart1', titleEn: 'Dart I', titlePt: 'Dardo I', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A blowgun dart — a small piece with close attention to fitting details and fletching.', descPt: 'Dardo de zarabatana — peça pequena com atenção a detalhes de encaixe e empenagem.' },
    { key: 'dart2', titleEn: 'Dart II', titlePt: 'Dardo II', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A variation in tip shape and visual balance relative to the dart set.', descPt: 'Variação de ponta e balanceamento visual em relação ao conjunto de dardos.' },
    { key: 'dart3', titleEn: 'Dart III', titlePt: 'Dardo III', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'The highest mesh density in the series, built for close-up detail readability.', descPt: 'Maior densidade de malha da série, pensada para leitura de detalhe em close-up.' },
    { key: 'shuriken1', titleEn: 'Shuriken I', titlePt: 'Shuriken I', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A four-pointed ninja star with a consistent bevel for silhouette readability at a distance.', descPt: 'Estrela ninja de quatro pontas, com bisel consistente para leitura de silhueta a distância.' },
    { key: 'shuriken2', titleEn: 'Shuriken II', titlePt: 'Shuriken II', tagEn: 'Bladed Weapon', tagPt: 'Arma Branca', descEn: 'A variant with more elaborate geometry and extra edge detailing.', descPt: 'Variante com geometria mais elaborada e detalhamento adicional nas bordas.' },
    { key: 'axe', titleEn: 'Axe', titlePt: 'Machado', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'A combat axe built with hard-surface modeling, prioritizing visual weight in the blade head.', descPt: 'Machado de combate com hard-surface modeling, priorizando peso visual na cabeça da lâmina.' },
    { key: 'axe-double', titleEn: 'Double Axe', titlePt: 'Machado Duplo', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'A double-bladed variant, testing symmetry and mass distribution across the silhouette.', descPt: 'Variante de lâmina dupla, testando simetria e distribuição de massa na silhueta.' },
    { key: 'axe-expanded', titleEn: 'Expanded Axe', titlePt: 'Machado Expandido', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'An expanded blade with more dramatic curves, exploring shape readability at a distance.', descPt: 'Lâmina expandida com curvas mais dramáticas, explorando leitura de forma a distância.' },
    { key: 'axe-expanded-double', titleEn: 'Expanded Double Axe', titlePt: 'Machado Expandido Duplo', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'The double, expanded version — the most elaborate piece in the axe collection.', descPt: 'Versão dupla e expandida — a peça mais elaborada da coleção de machados.' },
    { key: 'drill', titleEn: 'Drill', titlePt: 'Furadeira', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'An industrial drill focused on mechanical detail and clear material readability.', descPt: 'Furadeira industrial com foco em detalhes mecânicos e leitura clara de material.' },
    { key: 'fixedkey', titleEn: 'Wrench', titlePt: 'Chave Fixa', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'A wrench with precise threading and contact-surface modeling.', descPt: 'Chave fixa com modelagem precisa de rosca e superfícies de contato.' },
    { key: 'hammer', titleEn: 'Hammer', titlePt: 'Martelo', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'A hammer with realistic PBR texturing, highlighting wear on the metal and wood from use.', descPt: 'Martelo com texturização PBR realista, destacando o desgaste de uso no metal e na madeira.' },
    { key: 'pliers', titleEn: 'Pliers', titlePt: 'Alicate', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'Pliers with separately modeled articulated parts, prepared for functional rigging.', descPt: 'Alicate com peças articuladas modeladas separadamente, preparado para rigging funcional.' },
    { key: 'saw', titleEn: 'Saw', titlePt: 'Serra', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: "A hand saw with fine detailing on the blade's teeth — the highest-density piece in the collection.", descPt: 'Serra manual com detalhamento fino nos dentes da lâmina — a peça de maior densidade da coleção.' },
    { key: 'screwdriver', titleEn: 'Screwdriver', titlePt: 'Chave de Fenda', tagEn: 'Hard-Surface', tagPt: 'Hard-Surface', descEn: 'A screwdriver with simple, direct modeling, focused on proportion and visual ergonomics.', descPt: 'Chave de fenda com modelagem simples e direta, foco em proporção e ergonomia visual.' },
  ];

  var DENSITY_LABEL = { en: 'High-Density · ', pt: 'Alta Densidade · ' };

  function currentLang() {
    return (window.RestinoI18n && window.RestinoI18n.getLang()) || 'en';
  }

  function localized(model, field) {
    var lang = currentLang();
    return model[field + (lang === 'pt' ? 'Pt' : 'En')];
  }

  // Pieces that don't have a reference render photo — they get a styled
  // initial/gradient tile instead of a poster background.
  var NO_POSTER = new Set(['skull', 'axe', 'axe-double', 'axe-expanded', 'axe-expanded-double', 'dart1', 'dart2', 'dart3', 'shuriken1', 'shuriken2']);

  // Pieces with no PBR texture set (base/normal/mask) — they get a plain
  // solid-color material instead of the usual textured PBR one.
  var NO_TEXTURE = new Set(['skull']);
  var SOLID_MATERIAL_COLOR = { skull: 0xe4dbc8 }; // bone/ceramic tone

  var isMobile = window.matchMedia('(max-width: 768px)').matches || /Mobi|Android/i.test(navigator.userAgent);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buildCarousel();

  boot().catch(function (err) {
    console.error('[gallery3d] failed to initialize viewer:', err);
    showFallback();
  });

  function buildCarousel() {
    var track = document.getElementById('model-carousel');
    if (!track) return;

    MODELS.forEach(function (m, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'model-thumb' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.dataset.model = m.key;

      if (NO_POSTER.has(m.key)) {
        btn.classList.add('model-thumb-fallback');
        btn.innerHTML = '<span class="model-thumb-icon">◈</span><span class="model-thumb-label">' + localized(m, 'title') + '</span>';
      } else {
        btn.style.backgroundImage = "url('assets/models/" + m.key + "/poster.jpg')";
        btn.innerHTML = '<span class="model-thumb-label">' + localized(m, 'title') + '</span>';
      }

      track.appendChild(btn);
    });

    var prevBtn = document.getElementById('carousel-prev');
    var nextBtn = document.getElementById('carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { scrollCarousel(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollCarousel(1); });

    function scrollCarousel(dir) {
      var card = track.querySelector('.model-thumb');
      var step = card ? card.getBoundingClientRect().width + 14 : 140;
      track.scrollBy({ left: dir * step * 3, behavior: 'smooth' });
    }
  }

  // Re-label carousel thumbs in place when the site language toggles —
  // titles like "Axe"/"Machado" differ, so this can't just be left alone.
  function relabelCarousel() {
    document.querySelectorAll('.model-thumb').forEach(function (btn) {
      var model = MODELS.find(function (m) { return m.key === btn.dataset.model; });
      var label = btn.querySelector('.model-thumb-label');
      if (model && label) label.textContent = localized(model, 'title');
    });
  }

  function showFallback() {
    var loading = document.getElementById('viewer-loading');
    var fallback = document.getElementById('viewer-fallback');
    if (loading) loading.classList.add('is-hidden');
    if (fallback) fallback.hidden = false;
  }

  async function boot() {
    if (!window.WebGLRenderingContext) throw new Error('WebGL unsupported');

    var THREE = await import('three');
    var FBXLoaderMod = await import('three/addons/loaders/FBXLoader.js');
    var OrbitControlsMod = await import('three/addons/controls/OrbitControls.js');
    var RoomEnvMod = await import('three/addons/environments/RoomEnvironment.js');

    var FBXLoader = FBXLoaderMod.FBXLoader;
    var OrbitControls = OrbitControlsMod.OrbitControls;
    var RoomEnvironment = RoomEnvMod.RoomEnvironment;

    var stage = document.getElementById('viewer-stage');
    var canvas = document.getElementById('viewer-canvas');
    var loadingEl = document.getElementById('viewer-loading');
    var titleEl = document.getElementById('viewer-title');
    var tagEl = document.getElementById('viewer-tag');
    var descEl = document.getElementById('viewer-desc');
    var toggleBtn = document.getElementById('viewer-autorotate');
    var wireframeBtn = document.getElementById('viewer-wireframe');

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    // Mobile: cap pixel ratio harder — full devicePixelRatio (often 3 on phones)
    // multiplies fragment-shader cost for barely any visible sharpness gain.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile; // shadow maps are one of the priciest GPU costs on phones
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();

    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    var camera = new THREE.PerspectiveCamera(35, 4 / 3, 0.05, 200);
    camera.position.set(2, 1.4, 3);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.05;
    controls.maxDistance = 500;
    controls.autoRotate = true;
    controls.autoRotateSpeed = isMobile ? 1.6 : 2.2;

    var autoRotateWanted = true;

    controls.addEventListener('start', function () {
      controls.autoRotate = false;
    });
    controls.addEventListener('end', function () {
      // Resume immediately on release, not after an idle delay — matches
      // what people expect from a "let go and it keeps spinning" viewer.
      if (autoRotateWanted) controls.autoRotate = true;
    });

    toggleBtn.addEventListener('click', function () {
      autoRotateWanted = !autoRotateWanted;
      controls.autoRotate = autoRotateWanted;
      toggleBtn.setAttribute('aria-pressed', String(autoRotateWanted));
    });

    // Wireframe view — proves clean topology instead of just showing the
    // final render, same idea used for technical-modeling breakdowns.
    var wireframeWanted = false;
    wireframeBtn.addEventListener('click', function () {
      wireframeWanted = !wireframeWanted;
      wireframeBtn.setAttribute('aria-pressed', String(wireframeWanted));
      if (current && current.userData.material) {
        current.userData.material.wireframe = wireframeWanted;
      }
    });

    // ---- Lighting rig: key + accent rim + soft fill, plus a shadow-catcher ground ----
    var key = new THREE.DirectionalLight(0xfff2e0, 2.2);
    key.position.set(3, 4, 4);
    if (!isMobile) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.bias = -0.0005;
    }
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rim.position.set(-4, 2.5, -3);
    scene.add(rim);

    var fill = new THREE.AmbientLight(0x334155, 0.6);
    scene.add(fill);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.32 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isMobile;
    ground.visible = !isMobile; // pure cost on mobile without shadows to catch
    scene.add(ground);

    // ---- Resize handling ----
    // Belt-and-suspenders: ResizeObserver is the primary signal, but we also
    // listen to window 'resize' (covers environments/edge-cases where RO is
    // late or throttled) and re-check a few times right after boot in case
    // web-font loading or another late layout shift changed the stage size
    // after our first measurement.
    function resize() {
      var w = stage.clientWidth;
      var h = stage.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    new ResizeObserver(resize).observe(stage);
    window.addEventListener('resize', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    resize();
    [50, 200, 600, 1500].forEach(function (ms) { setTimeout(resize, ms); });

    // ---- Render loop ----
    renderer.setAnimationLoop(function () {
      controls.update();
      renderer.render(scene, camera);
    });

    // ---- Model loading / caching ----
    var fbxLoader = new FBXLoader();
    var textureLoader = new THREE.TextureLoader();
    var cache = new Map();
    var current = null;
    var loadToken = 0;

    function loadModel(key_) {
      if (cache.has(key_)) return Promise.resolve(cache.get(key_));
      var base = 'assets/models/' + key_ + '/';
      var noTexture = NO_TEXTURE.has(key_);

      var loaders = [fbxLoader.loadAsync(base + 'model.fbx')];
      if (!noTexture) {
        loaders.push(
          textureLoader.loadAsync(base + 'base.png'),
          textureLoader.loadAsync(base + 'normal.png'),
          textureLoader.loadAsync(base + 'mask.png')
        );
      }

      return Promise.all(loaders).then(function (res) {
        var obj = res[0];
        var material;

        if (noTexture) {
          material = new THREE.MeshStandardMaterial({
            color: SOLID_MATERIAL_COLOR[key_] || 0xcccccc,
            roughness: 0.75,
            metalness: 0.05,
            envMapIntensity: 1.15,
          });
        } else {
          var baseTex = res[1], normalTex = res[2], maskTex = res[3];
          baseTex.colorSpace = THREE.SRGBColorSpace;

          material = new THREE.MeshStandardMaterial({
            map: baseTex,
            normalMap: normalTex,
            roughnessMap: maskTex,
            metalnessMap: maskTex,
            roughness: 1,
            metalness: 1,
            envMapIntensity: 1.15,
          });
        }

        obj.traverse(function (child) {
          if (child.isMesh) {
            child.material = material;
            child.castShadow = !isMobile;
            child.receiveShadow = !isMobile;
          }
        });

        obj.visible = false;
        obj.userData.material = material; // single shared material per model — lets the wireframe toggle flip it in one place
        scene.add(obj);
        cache.set(key_, obj);
        return obj;
      });
    }

    function frame(object) {
      var box = new THREE.Box3().setFromObject(object);
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      var fov = camera.fov * (Math.PI / 180);
      var dist = (maxDim / 2 / Math.tan(fov / 2)) * 1.9;

      camera.near = dist / 100;
      camera.far = dist * 100;
      camera.updateProjectionMatrix();

      camera.position.set(center.x + dist * 0.5, center.y + dist * 0.32, center.z + dist * 0.85);
      controls.target.copy(center);
      controls.minDistance = dist * 0.15;
      controls.maxDistance = dist * 4;
      controls.update();

      ground.position.set(center.x, box.min.y, center.z);
    }

    // Small fade-in when a model becomes visible, instead of a hard cut —
    // cheap (one material, one tween) but reads as a much more polished
    // loading state, matching the attention every reference portfolio in
    // referencias_portfolio_tech_3d.md pays to its "reveal" moment.
    function fadeIn(material) {
      if (reduceMotion) return;
      material.transparent = true;
      material.opacity = 0;
      var start = null;
      var duration = 320;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        material.opacity = t;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          material.transparent = false; // back to opaque: cheaper to render, correct depth-sorting
          material.opacity = 1;
        }
      }
      requestAnimationFrame(step);
    }

    // Tracks whichever model is currently shown so a language toggle can
    // re-render its title/tag/description in place, with no reload and no
    // re-fetching the model itself.
    var activeMeta = null;
    function applyMetaText(meta) {
      titleEl.textContent = localized(meta, 'title');
      tagEl.textContent = DENSITY_LABEL[currentLang()] + localized(meta, 'tag');
      descEl.textContent = localized(meta, 'desc');
    }
    document.addEventListener('restino:langchange', function () {
      relabelCarousel();
      if (activeMeta) applyMetaText(activeMeta);
    });

    function centerThumbInCarousel(thumb) {
      var track = document.getElementById('model-carousel');
      var trackRect = track.getBoundingClientRect();
      var thumbRect = thumb.getBoundingClientRect();
      var delta = (thumbRect.left + thumbRect.width / 2) - (trackRect.left + trackRect.width / 2);
      track.scrollBy({ left: delta, behavior: 'smooth' });
    }

    async function activate(key_, meta) {
      var token = ++loadToken;
      loadingEl.classList.remove('is-hidden');

      var obj;
      try {
        obj = await loadModel(key_);
      } catch (err) {
        console.error('[gallery3d] failed to load model "' + key_ + '":', err);
        loadingEl.classList.add('is-hidden');
        return;
      }
      if (token !== loadToken) return; // a newer selection superseded this one

      if (current) current.visible = false;
      obj.visible = true;
      current = obj;
      // Carry the wireframe toggle state over to whichever model is now showing
      // — each model has its own material instance, cached independently.
      if (obj.userData.material) {
        obj.userData.material.wireframe = wireframeWanted;
        fadeIn(obj.userData.material);
      }

      frame(obj);

      activeMeta = meta;
      applyMetaText(meta);

      document.querySelectorAll('.model-thumb').forEach(function (t) {
        var active = t.dataset.model === key_;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        // Center the active thumb inside the carousel strip itself — never
        // use scrollIntoView() here: on a page this size, "nearest" can
        // decide the *whole document* needs to scroll to reveal an
        // off-screen carousel, which is exactly what was yanking the page
        // down to the gallery section on load.
        if (active) centerThumbInCarousel(t);
      });

      controls.autoRotate = autoRotateWanted;

      loadingEl.classList.add('is-hidden');
    }

    document.getElementById('model-carousel').addEventListener('click', function (e) {
      var btn = e.target.closest('.model-thumb');
      if (!btn) return;
      var model = MODELS.find(function (m) { return m.key === btn.dataset.model; });
      if (model) activate(model.key, model);
    });

    // Load the first model.
    await activate(MODELS[0].key, MODELS[0]);
  }
})();
