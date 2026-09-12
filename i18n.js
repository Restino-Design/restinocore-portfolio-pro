// Lightweight bilingual toggle (EN default / PT-BR) — no framework, no build
// step, matching the rest of this project. Loads first (regular script, not
// deferred), applies the saved language synchronously before paint, and
// exposes window.RestinoI18n so gallery.js's own bilingual model data (title/
// tag/description per 3D piece) can read the current language without a
// second localStorage implementation.
(function () {
  var STORAGE_KEY = 'restino:lang';

  // Inline SVGs instead of flag emoji: Windows has no font support for
  // regional-indicator flag sequences, so 🇧🇷/🇺🇸 render as bare "BR"/"US"
  // letters there instead of an actual flag — these draw the same on every OS.
  var FLAG_BR =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="12" fill="#009739"/>' +
    '<polygon points="12,4 21,12 12,20 3,12" fill="#FEDD00"/>' +
    '<circle cx="12" cy="12" r="4.2" fill="#002776"/>' +
    '</svg>';

  var FLAG_US =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
    '<defs><clipPath id="usFlagClip"><circle cx="12" cy="12" r="12"/></clipPath></defs>' +
    '<g clip-path="url(#usFlagClip)">' +
    '<rect width="24" height="24" fill="#B22234"/>' +
    '<rect y="2.4" width="24" height="2.4" fill="#fff"/>' +
    '<rect y="7.2" width="24" height="2.4" fill="#fff"/>' +
    '<rect y="12" width="24" height="2.4" fill="#fff"/>' +
    '<rect y="16.8" width="24" height="2.4" fill="#fff"/>' +
    '<rect y="21.6" width="24" height="2.4" fill="#fff"/>' +
    '<rect width="11" height="13" fill="#3C3B6E"/>' +
    '<circle cx="2.5" cy="2.5" r="0.6" fill="#fff"/><circle cx="5.5" cy="2.5" r="0.6" fill="#fff"/><circle cx="8.5" cy="2.5" r="0.6" fill="#fff"/>' +
    '<circle cx="4" cy="5" r="0.6" fill="#fff"/><circle cx="7" cy="5" r="0.6" fill="#fff"/>' +
    '<circle cx="2.5" cy="7.5" r="0.6" fill="#fff"/><circle cx="5.5" cy="7.5" r="0.6" fill="#fff"/><circle cx="8.5" cy="7.5" r="0.6" fill="#fff"/>' +
    '<circle cx="4" cy="10" r="0.6" fill="#fff"/><circle cx="7" cy="10" r="0.6" fill="#fff"/>' +
    '</g>' +
    '</svg>';

  var TRANSLATIONS = {
    en: {
      'meta.title': 'Restino — Technical 3D Artist | Portfolio',
      'meta.description': "Restino's portfolio — a Technical 3D Artist specializing in modeling, rigging and real-time environments with Autodesk Maya, Unity and Roblox Studio.",
      'nav.work': 'Work',
      'nav.gallery': '3D Gallery',
      'certificate': `ESCOLA SANTOS TECH
                      Vocational Education
                      CERTIFICATE
                      Of Completion
                      Santos Tech School certifies that
                      Enzo Restino Azevedo
                      also known by the artistic name RestinoCore
                      has successfully completed the Professional Programming course, with a total workload of 192 hours, held in the period from August 2024 to August 2026. Training focused on the job market covering 3D modeling, character animation, and rigging in Autodesk Maya, 3D texturing and texture creation in the Substance family (Substance Painter), game development in Roblox Studio, Unity, and Unreal Engine, programming in C# (Unity) and Luau (Roblox Studio), as well as website development with HTML, CSS, and JavaScript.
                      Henrique L. S.
                      DIRECTORATE
                      SANTOS TECH 2026 COMPLETION
                      Rodrigo Santos
                      PEDAGOGICAL COORDINATION
                      Ribeirão Preto, August 29, 2026 | Registration No. ST-PP-2026-0829-ERA
                      Av. Nove de Julho, 1992 – Jardim América, Ribeirão Preto/SP, 14020-170`,
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'hero.title': 'I turn complex concepts into refined, production-ready geometry.',
      'hero.sub': 'A specialist in Autodesk Maya, focused on technical modeling, rigging and optimized environments for real-time engines (Unity, Roblox Studio). I balance the rigor of industrial design with the fluidity of organic forms.',
      'hero.ctaWork': 'View projects',
      'hero.ctaContact': 'Get in touch',
      'work.heading': 'Selected projects',
      'project.colp.tag': 'PlayCanvas · Web3D · Full-Stack Development',
      'project.colp.role': 'Role: Solo Developer / Game Designer',
      'project.colp.desc': 'Developed an arcade game built in PlayCanvas, leveraging Supabase for real-time cloud and session data. I self-taught audio production in under 3 months to make the OST and SFX using FL Studio and Adobe Audition. For the visual impact, I created frames and VFX by learning a Photoshop and JSON workflow in under two hours — completing rapid asset iterations to deliver an immersive and fully interactive experience.',
      'project.colp.imgAlt': 'Cover art for the Colp project',
      'project.colp.linkGame': 'Open game ↗',
      'project.dysfood.tag': 'Roblox Studio · Luau · Audio Design',
      'project.dysfood.role': 'Role: Solo developer',
      'project.dysfood.desc': 'A technical deep dive into the Roblox engine to build an atmospheric horror experience. I worked through the learning curve of Luau scripting and structural horror design, and composed custom sound effects to deepen immersion — resulting in a visceral, memorable experimental debut.',
      'project.dysfood.imgAlt': 'Cover art for the Dys-food project',
      'project.upa.tag': 'Roblox Studio · Low-Poly · Mobile',
      'project.upa.role': 'Role: Freelance for client',
      'project.upa.desc': "Built a modular hospital complex in low-poly, strictly respecting Roblox's polygon budget to guarantee smooth performance on mobile devices. I structured the meshes around precise, optimized collisions and textured authentic hospital assets, delivering a functional environment ready to drop straight into Roblox Studio.",
      'project.golfin.tag': 'PBR · Archviz · Real-Time Render',
      'project.golfin.role': 'Role: 3D Modeler / Archviz',
      'project.golfin.desc': 'Modeled a full apartment from scratch, focused on PBR texturing and an urban aesthetic. I built custom assets to achieve high contrast and an abstract visual narrative within the rendered environment.',
      'project.golfin.linkFull': 'Open fullscreen ↗',
      'project.golfin.launch': '▶ Tap to load the interactive 3D scene',
      'project.iron.tag': 'Unity HDRP · Lighting · Cinematic Rendering',
      'project.iron.role': 'Role: Environment / Lighting Artist',
      'project.iron.desc': "A move into a high-fidelity workflow. The main challenge was mastering Unity's HDRP lighting system with no prior experience with the tool. Iterating on cinematic rendering techniques, I authored the scene's lighting with precision, bringing the environment to life.",
      'project.iron.imgAlt1': 'Lighting render — High-Level Iron Market',
      'project.iron.imgAlt2': 'Environment render — High-Level Iron Market',
      'project.lowpoly.tag': 'Low-Poly · Environment Art · Mobile Performance',
      'project.lowpoly.role': 'Role: Environment Artist (corporate project)',
      'project.lowpoly.desc': 'Developed a low-poly environment focused on high performance for mobile devices, keeping it smooth without compromising visual identity. I created authentic forest assets to build a cohesive ecosystem, balancing artistic stylization with gameplay functionality.',
      'project.lowpoly.imgAlt': 'Low-poly environment assets',
      'project.character.tag': 'Maya · Rigging · Retargeting',
      'project.character.role': 'Role: Character Artist / Rigger',
      'project.character.desc': "Originally a client commission, the project grew into a personal exploration. The main technical challenge was self-teaching advanced rigging and retargeting in Maya — solved by implementing a streamlined animation workflow that pulled the character's distinctive movement together in the final render.",
      'project.character.imgAlt1': 'Character art — Character Ready',
      'project.character.imgAlt2': 'Character turnaround — Character Ready',
      'project.mkprime.tag': 'Creative Writing · AI Automation · Audio Engineering',
      'project.mkprime.role': 'Role: Freelance sequence for MK PRIME',
      'project.mkprime.desc': 'An experimental pipeline combining creative strategy, process engineering, and post-production. I refactored viral reference frameworks improvising "common enemy" and charisma for ad scripts (optimizing retention with news hook like the "Padre CLT" angle); built a technical taxonomy framework (for CEA) to structure ad data for automated AI creative pipelines (avatars/TTS) in Claude; and processed raw lecture audio using precision time-stretching (+20%), pitch correction, and EQ cleanup to deliver fluid, mobile-ready dialogue.',
      'project.mkprime.imgAlt1': 'Creative writing reference — MK PRIME',
      'project.mkprime.imgAlt2': 'Creative writing board — MK PRIME',
      'gallery.heading': '3D Gallery',
      'gallery.intro': 'Real models, not videos: rotate, zoom and inspect the mesh and texturing of each piece in 360°. Switch on wireframe mode to see the actual topology behind the render.',
      'viewer.loading': 'Loading model…',
      'viewer.fallback': "Your browser couldn't load the interactive 3D viewer — here's a reference render instead.",
      'viewer.autorotate': '⟳ Auto-rotate',
      'viewer.hint': 'Drag to rotate · Scroll to zoom',
      'about.heading': 'About',
      'about.lead': 'I\'m a Technical 3D Artist driven by the synergy between innovation and experimental modeling exploration. My expertise in <strong>Autodesk Maya</strong> centers on technical structure — turning complex mechanical concepts into refined, high-fidelity geometry.',
      'about.body': "I don't just model — I engineer evolving digital artifacts with a future-oriented mindset, balancing the rigor of industrial design with the fluidity of organic, creative atmospheres.",
      'about.skillPoly': 'Low & High-Poly Modeling',
      'about.skillPbr': 'PBR Texturing',
      'contact.heading': "Let's talk",
      'contact.lead': 'Open to freelance projects and opportunities in 3D modeling, real-time environments and game asset development.',
      'contact.email': 'Email',
      'contact.whatsappHref': 'https://wa.me/5516994041726?text=Hi!%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%203D%20project.',
      'footer.rights': '© 2026 Restino. All rights reserved.',
      'footer.backToTop': 'Back to top ↑',
    },
    pt: {
      'meta.title': 'Restino — Artista 3D Técnico | Portfólio',
      'meta.description': 'Portfólio de Restino, Technical 3D Artist especializado em modelagem, rigging e ambientes em tempo real com Autodesk Maya, Unity e Roblox Studio.',
      'nav.work': 'Trabalho',
      'certificate': '',
      'nav.gallery': 'Galeria 3D',
      'nav.about': 'Sobre',
      'nav.contact': 'Contato',
      'hero.title': 'Transformo conceitos complexos em geometria refinada e pronta para produção.',
      'hero.sub': 'Especialista em Autodesk Maya, com foco em modelagem técnica, rigging e ambientes otimizados para engines em tempo real (Unity, Roblox Studio). Equilibro o rigor do design industrial com a fluidez de formas orgânicas.',
      'hero.ctaWork': 'Ver projetos',
      'hero.ctaContact': 'Falar comigo',
      'work.heading': 'Projetos selecionados',
      'project.colp.tag': 'PlayCanvas · Web3D · Full-Stack Development',
      'project.colp.role': 'Papel: Desenvolvedor Solo / Game Designer',
      'project.colp.desc': 'Desenvolvi um jogo arcade construído no PlayCanvas, utilizando Supabase para dados de nuvem e sessão em tempo real. Aprendi produção de áudio de forma autodidata em menos de 3 meses para criar a trilha sonora e SFX usando FL Studio e Adobe Audition. Para o impacto visual, criei quadros e VFX aprendendo um fluxo de trabalho com Photoshop e JSON em menos de duas horas — completando iterações rápidas de assets para entregar uma experiência imersiva e totalmente interativa.',
      'project.colp.imgAlt': 'Arte de capa do projeto Colp',
      'project.colp.linkGame': 'Open game ↗',
      'project.dysfood.tag': 'Roblox Studio · Luau · Design de Áudio',
      'project.dysfood.role': 'Papel: Desenvolvedor solo',
      'project.dysfood.desc': 'Mergulho técnico na Roblox Engine para criar uma experiência de horror atmosférica. Superei a curva de aprendizado de scripting em Luau e de design estrutural de horror, e desenvolvi efeitos sonoros customizados para reforçar a imersão — resultando em uma estreia experimental visceral e memorável.',
      'project.dysfood.imgAlt': 'Arte de capa do projeto Dys-food',
      'project.upa.tag': 'Roblox Studio · Low-Poly · Mobile',
      'project.upa.role': 'Papel: Freelancer para cliente',
      'project.upa.desc': 'Desenvolvimento de um complexo hospitalar modular em low-poly, respeitando estritamente os limites de polígonos da Roblox Engine para garantir alta performance em dispositivos móveis. Estruturei malhas com foco em colisões precisas e otimizadas, e texturizei assets hospitalares autênticos, entregando um ambiente funcional pronto para implementação direta no Roblox Studio.',
      'project.golfin.tag': 'PBR · Archviz · Real-Time Render',
      'project.golfin.role': 'Papel: Modelador 3D / Archviz',
      'project.golfin.desc': 'Modelagem completa de um apartamento do zero, com foco em texturização PBR e estética urbana. Criei assets customizados para alcançar alto contraste e narrativa visual abstrata dentro do ambiente renderizado.',
      'project.golfin.linkFull': 'Abrir em tela cheia ↗',
      'project.golfin.launch': '▶ Toque para carregar a cena 3D interativa',
      'project.iron.tag': 'Unity HDRP · Lighting · Cinematic Rendering',
      'project.iron.role': 'Papel: Environment / Lighting Artist',
      'project.iron.desc': 'Transição para um workflow de alta fidelidade. O principal desafio foi dominar o sistema de iluminação HDRP da Unity sem familiaridade prévia com a ferramenta. Iterando sobre técnicas de renderização cinematográfica, autorei a iluminação da cena com precisão, dando vida ao ambiente.',
      'project.iron.imgAlt1': 'Render de iluminação — High-Level Iron Market',
      'project.iron.imgAlt2': 'Render de ambiente — High-Level Iron Market',
      'project.lowpoly.tag': 'Low-Poly · Environment Art · Mobile Performance',
      'project.lowpoly.role': 'Papel: Environment Artist (projeto corporativo)',
      'project.lowpoly.desc': 'Desenvolvimento de um ambiente low-poly focado em alta performance para dispositivos móveis, garantindo fluidez sem comprometer a identidade visual. Criei assets florestais autênticos para compor um ecossistema coeso, equilibrando estilização artística com funcionalidade de gameplay.',
      'project.lowpoly.imgAlt': 'Assets de ambiente low-poly',
      'project.character.tag': 'Maya · Rigging · Retargeting',
      'project.character.role': 'Papel: Character Artist / Rigger',
      'project.character.desc': 'Originalmente uma comissão de cliente, o projeto evoluiu para uma exploração autoral. O principal desafio técnico foi autoaprender Rigging avançado e Retargeting em Maya — resolvido com a implementação de um workflow de animação simplificado, que consolidou a movimentação única do personagem no render final.',
      'project.character.imgAlt1': 'Character art — Character Ready',
      'project.character.imgAlt2': 'Character turnaround — Character Ready',
      'project.mkprime.tag': 'Creative Writing · Automação com IA · Engenharia de Áudio',
      'project.mkprime.role': 'Papel: Sequência freelance para MK PRIME',
      'project.mkprime.desc': 'Um pipeline experimental combinando estratégia criativa, engenharia de processo e pós-produção. Refatorei frameworks de referências virais improvisando "inimigo comum" e carisma para roteiros de anúncio (otimizando retenção com gancho de notícia como o ângulo "Padre CLT"); construí um framework de taxonomia técnica (para CEA) para estruturar dados de anúncios em pipelines criativos automatizados de IA (avatares/TTS) no Claude; e processei áudio bruto de palestra com time-stretching preciso (+20%), correção de pitch e limpeza de EQ para entregar diálogo fluido, pronto para mobile.',
      'project.mkprime.imgAlt1': 'Referência de copy — MK PRIME',
      'project.mkprime.imgAlt2': 'Quadro de copy — MK PRIME',
      'gallery.heading': 'Galeria 3D',
      'gallery.intro': 'Modelos reais, não vídeos: gire, aproxime e inspecione a malha e a texturização de cada peça em 360°. Ative o modo wireframe para ver a topologia real por trás do render.',
      'viewer.loading': 'Carregando modelo…',
      'viewer.fallback': 'Seu navegador não conseguiu carregar o visualizador 3D interativo — aqui está um render de referência.',
      'viewer.autorotate': '⟳ Auto-rotação',
      'viewer.hint': 'Arraste para girar · Scroll para aproximar',
      'about.heading': 'Sobre',
      'about.lead': 'Sou um Technical 3D Artist movido pela sinergia entre inovação e exploração experimental de modelagem. Minha expertise em <strong>Autodesk Maya</strong> foca em estrutura técnica — transformando conceitos mecânicos complexos em geometria refinada e de alta fidelidade.',
      'about.body': 'Não apenas modelo: engenharia artefatos digitais evolutivos com uma mentalidade orientada ao futuro, equilibrando o rigor do design industrial com a fluidez de atmosferas orgânicas e criativas.',
      'about.skillPoly': 'Modelagem Low & High-Poly',
      'about.skillPbr': 'Texturização PBR',
      'contact.heading': 'Vamos conversar',
      'contact.lead': 'Aberto a projetos freelance e oportunidades em modelagem 3D, ambientes real-time e desenvolvimento de assets para games.',
      'contact.email': 'E-mail',
      'contact.whatsappHref': 'https://wa.me/5516994041726?text=Ol%C3%A1!%20Vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20discutir%20um%20projeto%203D.',
      'footer.rights': '© 2026 Restino. Todos os direitos reservados.',
      'footer.backToTop': 'Voltar ao topo ↑',
    },
  };

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode etc — toggle still works for the session */ }
  }

  function applyLanguage(lang) {
    var dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr'); // "attrName:dictKey"
      var sep = spec.indexOf(':');
      var attr = spec.slice(0, sep);
      var key = spec.slice(sep + 1);
      if (dict[key] != null) el.setAttribute(attr, dict[key]);
    });

    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
      // The button always shows the flag of the language you'd SWITCH TO —
      // the Brazil flag while reading in English (click to go to
      // Portuguese), the US flag while reading in Portuguese (click to go
      // back to English). The aria-label is written in the CURRENT reading
      // language, not the target one.
      if (lang === 'pt') {
        toggle.innerHTML = FLAG_US;
        toggle.setAttribute('aria-label', 'Mudar para inglês');
      } else {
        toggle.innerHTML = FLAG_BR;
        toggle.setAttribute('aria-label', 'Switch to Portuguese');
      }
    }

    // Lets gallery.js (loaded as a deferred module, so it may boot after or
    // before this) refresh its own bilingual model data without a reload.
    document.dispatchEvent(new CustomEvent('restino:langchange', { detail: { lang: lang } }));
  }

  window.RestinoI18n = {
    STORAGE_KEY: STORAGE_KEY,
    getLang: function () {
      return getStoredLang() === 'pt' ? 'pt' : 'en';
    },
  };

  applyLanguage(window.RestinoI18n.getLang());

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('lang-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var next = window.RestinoI18n.getLang() === 'pt' ? 'en' : 'pt';
      setStoredLang(next);
      applyLanguage(next);
    });
  });
})();
