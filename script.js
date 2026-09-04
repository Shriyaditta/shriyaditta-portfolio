/* ============================================================
   SHRIYADITTA.EXE — runtime
   ============================================================ */
(function(){
  "use strict";
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- touch detection (disables custom cursor) ---------- */
  let usedTouch = false;
  window.addEventListener('touchstart', ()=>{ usedTouch = true; document.body.classList.add('using-touch'); }, {once:true, passive:true});

  /* ---------- BOOT SEQUENCE ---------- */
  const bootLogLines = [
    'mounting /personality',
    'loading /engineering',
    'loading /design',
    'indexing /projects',
    'checking /curiosity',
    'spawning /terminal',
    'system ready.'
  ];
  function runBoot(){
    const body = document.body;
    body.classList.add('boot-active');
    const logEl = $('#bootLog');
    const fill = $('#bootBarFill');
    const pct = $('#bootPct');
    const enterBtn = $('#bootEnter');

    if (prefersReduced){
      // Skip animated boot for reduced-motion users, but keep it informative & fast
      bootLogLines.forEach(l=>{
        const d = document.createElement('div');
        d.innerHTML = `<span class="ok">&gt;</span> ${l}`;
        d.style.opacity = 1;
        logEl.appendChild(d);
      });
      fill.style.width = '100%';
      pct.textContent = '100%';
      enterBtn.disabled = false;
      enterFn();
      return;
    }

    let i = 0;
    const step = ()=>{
      if (i < bootLogLines.length){
        const d = document.createElement('div');
        d.innerHTML = `<span class="ok">&gt;</span> ${bootLogLines[i]}`;
        d.style.animationDelay = '0s';
        logEl.appendChild(d);
        const p = Math.round(((i+1)/bootLogLines.length)*100);
        fill.style.width = p + '%';
        pct.textContent = p + '%';
        i++;
        setTimeout(step, 280 + Math.random()*180);
      } else {
        enterBtn.disabled = false;
      }
    };
    setTimeout(step, 500);

    function enterFn(){
      document.body.setAttribute('data-boot','done');
      document.body.classList.remove('boot-active');
    }
    enterBtn.addEventListener('click', enterFn);
  }
  runBoot();

  /* ---------- CUSTOM CURSOR ---------- */
  const cDot = $('#cursorDot');
  const cLabel = $('#cursorLabel');
  let mouseX = innerWidth/2, mouseY = innerHeight/2, curX = mouseX, curY = mouseY;
  window.addEventListener('mousemove', e=>{ mouseX = e.clientX; mouseY = e.clientY; });
  function cursorLoop(){
    curX += (mouseX-curX)*0.22; curY += (mouseY-curY)*0.22;
    cDot.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%)`;
    cLabel.style.transform = `translate(${curX}px,${curY}px)`;
    requestAnimationFrame(cursorLoop);
  }
  if(!prefersReduced) requestAnimationFrame(cursorLoop);
  else window.addEventListener('mousemove', e=>{
    cDot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    cLabel.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });

  document.addEventListener('mouseover', e=>{
    const target = e.target.closest('[data-cursor], a, button, input');
    if (!target){ cDot.classList.remove('expand'); cLabel.classList.remove('show'); return; }
    cDot.classList.add('expand');
    const label = target.getAttribute('data-cursor');
    if (label){ cLabel.textContent = label; cLabel.classList.add('show'); }
    else cLabel.classList.remove('show');
  });
  document.addEventListener('mouseout', e=>{
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('[data-cursor], a, button, input')){
      cDot.classList.remove('expand'); cLabel.classList.remove('show');
    }
  });

  /* ---------- BACKGROUND NEURAL NETWORK ---------- */
  const canvas = $('#bgCanvas');
  const ctx = canvas.getContext('2d');
  let W,H, nodes=[];
  function resizeCanvas(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
  function initNodes(){
    const count = Math.min(70, Math.floor((W*H)/26000));
    nodes = Array.from({length:count}, ()=>({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-0.5)*0.18, vy:(Math.random()-0.5)*0.18
    }));
  }
  resizeCanvas(); initNodes();
  window.addEventListener('resize', ()=>{ resizeCanvas(); initNodes(); });

  let bgMouse = {x:-9999,y:-9999};
  window.addEventListener('mousemove', e=>{ bgMouse.x=e.clientX; bgMouse.y=e.clientY; });

  function getAccentColors(){
    const styles = getComputedStyle(document.body);
    return {
      a: styles.getPropertyValue('--accent').trim() || '#8B6CFF',
      b: styles.getPropertyValue('--accent-2').trim() || '#2CE8C6'
    };
  }

  function drawBg(){
    ctx.clearRect(0,0,W,H);
    const {a,b} = getAccentColors();
    nodes.forEach(n=>{
      n.x += n.vx; n.y += n.vy;
      if (n.x<0||n.x>W) n.vx*=-1;
      if (n.y<0||n.y>H) n.vy*=-1;
      const dx = bgMouse.x-n.x, dy = bgMouse.y-n.y;
      const d = Math.sqrt(dx*dx+dy*dy);
      if (d < 140){ n.x -= dx*0.002; n.y -= dy*0.002; }
    });
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 150){
          ctx.strokeStyle = a;
          ctx.globalAlpha = (1-dist/150)*0.12;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 0.55;
    nodes.forEach(n=>{
      ctx.fillStyle = b;
      ctx.beginPath(); ctx.arc(n.x,n.y,1.4,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!prefersReduced) requestAnimationFrame(drawBg);
  }
  requestAnimationFrame(drawBg);
  if (prefersReduced){
    setInterval(drawBg, 1200); // gentle periodic redraw only
  }

  /* ---------- MODE TOGGLE ---------- */
  function setMode(mode){
    document.body.classList.toggle('mode-artist', mode==='artist');
    document.body.classList.toggle('mode-engineer', mode!=='artist');
    const label = mode==='artist' ? 'ARTIST MODE' : 'ENGINEER MODE';
    $('#modeLabel').textContent = label;
    $$('#modeToggleMobile span:last-child').forEach(s=>s.textContent = label);
    localStorage.setItem('ss-mode', mode);
  }
  const savedMode = (()=>{ try { return localStorage.getItem('ss-mode'); } catch(e){ return null; }})();
  setMode(savedMode==='artist' ? 'artist':'engineer');
  function toggleMode(){
    const isArtist = document.body.classList.contains('mode-artist');
    setMode(isArtist ? 'engineer':'artist');
  }
  $('#modeToggle').addEventListener('click', toggleMode);
  $('#modeToggleMobile').addEventListener('click', toggleMode);

  /* ---------- MOBILE NAV ---------- */
  const burger = $('#navBurger'), navMobile = $('#navMobile');
  burger.addEventListener('click', ()=>{
    const open = navMobile.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#navMobile a').forEach(a=>a.addEventListener('click', ()=>navMobile.classList.remove('open')));

  /* ---------- NAV SHRINK + ACTIVE LINK ---------- */
  const navEl = $('#mainNav');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-center a');
  window.addEventListener('scroll', ()=>{
    navEl.classList.toggle('shrink', window.scrollY > 80);
  }, {passive:true});

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if (en.isIntersecting){
        const id = en.target.id;
        navLinks.forEach(l=> l.classList.toggle('active', l.getAttribute('href')==='#'+id));
      }
    });
  }, {rootMargin:'-45% 0px -45% 0px'});
  sections.forEach(s=>io.observe(s));

  /* ---------- SCROLL REVEAL ---------- */
  $$('.section').forEach(s=>s.classList.add('reveal'));
  const revealIO = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if (en.isIntersecting) en.target.classList.add('in'); });
  }, {threshold:0.12});
  $$('.reveal').forEach(el=>revealIO.observe(el));

  /* ---------- HUD CLOCK ---------- */
  function tickClock(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    $('#hudClock').textContent = `${hh}:${mm}:${ss}`;
  }
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- HERO ORB INTERACTION ---------- */
  const orb = $('#heroOrb');
  if (orb && !prefersReduced){
    orb.addEventListener('mousemove', e=>{
      const r = orb.getBoundingClientRect();
      const px = (e.clientX - r.left - r.width/2)/r.width;
      const py = (e.clientY - r.top - r.height/2)/r.height;
      orb.style.transform = `rotateY(${px*10}deg) rotateX(${-py*10}deg)`;
    });
    orb.addEventListener('mouseleave', ()=>{ orb.style.transform = ''; });
    orb.style.transformStyle = 'preserve-3d';
  }

  /* ---------- THOUGHT PROCESS ---------- */
  const processData = {
    why: {
      num:'01 / WHY?', title:'START WITH THE TENSION.',
      body:"I usually begin by asking what's frustrating, unclear or unnecessarily hard. A project becomes interesting when the problem is sharper than the technology.",
      caseTag:'case →', caseTitle:'CLAUSEIQ', caseQ:'“Why is a 40-page contract still hard to understand?”'
    },
    observe: {
      num:'02 / OBSERVE', title:'WATCH THE REAL WORKFLOW.',
      body:"Before touching an editor, I look at how people actually deal with the problem today — the workarounds, the spreadsheets, the manual re-reading. The gaps there define the first version.",
      caseTag:'case →', caseTitle:'CAMPUS CONNECT', caseQ:'“Why does every hackathon team form over a WhatsApp group at 11pm?”'
    },
    build: {
      num:'03 / BUILD', title:'SHIP THE SMALLEST REAL THING.',
      body:"I build the thinnest version that actually solves the problem end-to-end, not a demo shell around it. Working software beats a polished mockup for learning what's actually hard.",
      caseTag:'case →', caseTitle:'CLAUSEIQ', caseQ:'A working risk-flagging pipeline before a single UI polish pass.'
    },
    break: {
      num:'04 / BREAK', title:'FIND WHERE IT FAILS.',
      body:"I push the system with real, messy inputs until it breaks — long documents, bad formatting, edge cases nobody asked for. That's where the actual engineering decisions live.",
      caseTag:'case →', caseTitle:'BUG MUSEUM', caseQ:'Context overflow, environment drift, feature creep — see the exhibits below.'
    },
    rebuild: {
      num:'05 / REBUILD', title:'FIX THE SYSTEM, NOT THE SYMPTOM.',
      body:"The fix is usually architectural — semantic chunking instead of a bigger context window, reproducible environments instead of a note to \u201Crun it again.\u201D Rebuilding well matters more than building fast.",
      caseTag:'case →', caseTitle:'CLAUSEIQ', caseQ:'Semantic chunking replaced blind full-document dumps into the model.'
    }
  };
  const processPanel = $('#processPanel');
  function renderProcess(key){
    const d = processData[key];
    processPanel.innerHTML = `
      <p class="pp-num">${d.num}</p>
      <h3 class="pp-title">${d.title}</h3>
      <p class="pp-body">${d.body}</p>
      <div class="pp-case">
        <span class="pp-case-tag">${d.caseTag} ${d.caseTitle}</span>
        <p class="pp-case-q">${d.caseQ}</p>
      </div>`;
  }
  renderProcess('why');
  $$('.process-node').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.process-node').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderProcess(btn.dataset.node);
    });
  });

  /* ---------- LAB 001 TYPOGRAPHY HOVER SCRAMBLE ---------- */
  const labTypo = $('#labTypo');
  if (labTypo){
    const words = ['SIGNAL','NOISE','PATTERN','SYSTEM','SIGNAL'];
    let idx = 0;
    labTypo.parentElement.addEventListener('mouseenter', ()=>{
      if (prefersReduced) return;
      idx = (idx+1)%words.length;
      labTypo.textContent = words[idx];
    });
  }

  /* ---------- PROJECT DATA + MODAL ---------- */
  const projects = {
    clauseiq: {
      status:'SS-01 // SHIPPED · LIVE',
      title:'CLAUSEIQ',
      desc:'AI-powered contract analysis for leases, NDAs and freelancer contracts — flags liability clauses, non-standard penalties and potential legal risk.',
      stack:['Python','LLMs','RAG','Streamlit','Groq API'],
      signal:'Risk detection + plain-English explanation',
      link:'https://clauseiq-live.streamlit.app/',
      arch:[
        ['USER','Uploads a lease, NDA or freelance contract.'],
        ['DOCUMENT','Raw text extracted from the source file.'],
        ['EXTRACTION','Clauses and structure pulled from the raw text.'],
        ['CHUNKING','Semantic segmentation keeps retrieved context useful.'],
        ['EMBEDDINGS','Chunks converted into vectors for retrieval.'],
        ['RAG','Relevant sections retrieved for the question at hand.'],
        ['LLM','Groq-hosted model reasons over the retrieved context.'],
        ['OUTPUT','Risk level + explanation, in plain English.']
      ],
      stories:[
        ['FAILURE MODE','Context overflow.','Long documents forced a better question: what evidence actually deserves model attention?'],
        ['DESIGN MOVE','Semantic chunking.','Retrieve relevant sections instead of sending the entire document blindly.'],
        ['OUTPUT','Human-readable risk.','Critical / Caution / Standard, each with a plain-English explanation.']
      ]
    },
    campusconnect: {
      status:'SS-02 // PROTOTYPE',
      title:'CAMPUS CONNECT',
      desc:'A student collaboration platform to match complementary skills and centralize campus project opportunities, including hackathon team formation and portfolio discovery.',
      stack:['Figma','Data Modeling','Product Architecture'],
      signal:'Skill matching + team formation',
      link:'https://vibe-sync-9552fdc5.base44.app/Home',
      arch:[
        ['STUDENT','Creates an account on the platform.'],
        ['PROFILE','Skills, interests and past projects captured.'],
        ['SKILLS','Structured skill data used for matching.'],
        ['MATCHING','Complementary skill sets surfaced to each other.'],
        ['TEAM FORMATION','Students group into a proposed team.'],
        ['PROJECT','Team lands on a shared project or hackathon.']
      ],
      stories:[
        ['OBSERVATION','Team formation is informal.','Most hackathon teams still form through word-of-mouth or last-minute group chats.'],
        ['DESIGN MOVE','Model skills as data.','Treating skills and interests as structured data made matching tractable.'],
        ['STATUS','Prototype stage.','Currently designed in Figma with the data model and product architecture defined.']
      ]
    }
  };

  const overlay = $('#modalOverlay');
  const modalBody = $('#modalBody');

  function openProject(key){
    const p = projects[key];
    if (!p) return;
    const archHtml = p.arch.map((n,i)=>{
      const connector = i < p.arch.length-1 ? '<div class="arch-connector"></div>' : '';
      return `<div class="arch-node">${n[0]}<div class="tip">${n[1]}</div></div>${connector}`;
    }).join('');
    const storiesHtml = p.stories.map(s=>`
      <div class="story-card">
        <span class="story-tag">${s[0]}</span>
        <p class="story-h">${s[1]}</p>
        <p class="story-p">${s[2]}</p>
      </div>`).join('');
    const linkHtml = p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="btn btn-primary m-link" data-cursor="OPEN">OPEN LIVE SYSTEM ↗</a>` : '';

    modalBody.innerHTML = `
      <p class="m-status">${p.status}</p>
      <h3 class="m-title">${p.title}</h3>
      <p class="m-desc">${p.desc}</p>

      <p class="m-block-label">STACK</p>
      <div class="m-stack">${p.stack.map(s=>`<span>${s}</span>`).join('')}</div>

      <p class="m-block-label">SIGNAL</p>
      <p class="m-signal">${p.signal}</p>

      <p class="m-block-label">ARCHITECTURE</p>
      <div class="arch">${archHtml}</div>

      <div class="story-cards">${storiesHtml}</div>

      ${linkHtml}
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  $$('.field-node').forEach(btn=>{
    btn.addEventListener('click', ()=>openProject(btn.dataset.project));
  });
  $('#modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e=>{ if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e=>{ if (e.key==='Escape') closeModal(); });

  /* ---------- BUG MUSEUM ---------- */
  $$('.exhibit').forEach(ex=>{
    ex.addEventListener('click', ()=>{
      const wasOpen = ex.classList.contains('open');
      $$('.exhibit').forEach(o=>o.classList.remove('open'));
      if (!wasOpen) ex.classList.add('open');
    });
  });

  /* ---------- SYSTEM LOG SCROLL FILL ---------- */
  const logSection = $('#journey');
  const logFill = $('#logLineFill');
  const logEntries = $$('.log-entry');
  function updateLog(){
    if (!logSection) return;
    const r = logSection.getBoundingClientRect();
    const total = r.height - innerHeight*0.6;
    const scrolled = Math.min(Math.max(-r.top, 0), Math.max(total,1));
    const pct = total>0 ? (scrolled/total)*100 : 0;
    if (logFill) logFill.style.height = pct + '%';
    const activeCount = Math.round((pct/100) * logEntries.length);
    logEntries.forEach((el,i)=> el.classList.toggle('active', i < activeCount || pct > 95));
  }
  window.addEventListener('scroll', updateLog, {passive:true});
  updateLog();

  /* ---------- ARTIST CANVAS ---------- */
  const aCanvas = $('#artistCanvas');
  if (aCanvas){
    const actx = aCanvas.getContext('2d');
    let aw, ah;
    function sizeArtist(){
      const r = aCanvas.getBoundingClientRect();
      aw = aCanvas.width = r.width * devicePixelRatio;
      ah = aCanvas.height = r.height * devicePixelRatio;
    }
    sizeArtist();
    window.addEventListener('resize', sizeArtist);
    let ax = 0.5, ay = 0.5, tax=0.5, tay=0.5;
    aCanvas.addEventListener('mousemove', e=>{
      const r = aCanvas.getBoundingClientRect();
      tax = (e.clientX-r.left)/r.width; tay = (e.clientY-r.top)/r.height;
    });
    function drawArtist(){
      ax += (tax-ax)*0.05; ay += (tay-ay)*0.05;
      actx.clearRect(0,0,aw,ah);
      const colors = ['#FF71CE','#FFD166','#8B6CFF','#2CE8C6'];
      colors.forEach((c,i)=>{
        const angle = (i/colors.length)*Math.PI*2 + ax*Math.PI;
        const cx = aw*0.5 + Math.cos(angle+ay*2)*aw*0.28;
        const cy = ah*0.5 + Math.sin(angle+ax*2)*ah*0.28;
        const grad = actx.createRadialGradient(cx,cy,0,cx,cy,aw*0.32);
        grad.addColorStop(0, c+'55');
        grad.addColorStop(1, c+'00');
        actx.fillStyle = grad;
        actx.beginPath(); actx.arc(cx,cy, aw*0.32, 0, Math.PI*2); actx.fill();
      });
      requestAnimationFrame(drawArtist);
    }
    requestAnimationFrame(drawArtist);
  }

  /* ---------- TERMINAL ---------- */
  const termOutput = $('#termOutput');
  const termInput = $('#termInput');
  function termPrint(html, cls){
    const line = document.createElement('div');
    line.className = 'term-line' + (cls ? ' '+cls : '');
    line.innerHTML = html;
    termOutput.appendChild(line);
    termOutput.scrollTop = termOutput.scrollHeight;
  }
  const commands = {
    help: ()=> `Available commands:\n  help        show this list\n  whoami      who is behind this system\n  ls          list sections\n  cat skills.txt   print core skills\n  projects    list shipped / building\n  log         short system log\n  contact     how to reach me\n  coffee      ?\n  sudo hire   ?\n  clear       clear the terminal`,
    whoami: ()=> `Shriyaditta Shinde — Computer Engineering student.\nbackend / applied AI / GenAI / systems / design.`,
    ls: ()=> `system  thoughts  lab  projects  journey  terminal  contact`,
    'cat skills.txt': ()=> `C++, Python, Java, JavaScript, C\nDSA, OOP, DBMS, OS, Computer Networks\nLLMs, RAG, Agentic AI, Prompt Engineering\nREST APIs, MERN, Git, GitHub, Figma`,
    projects: ()=> `SS-01  ClauseIQ          — AI contract intelligence — LIVE\nSS-02  Campus Connect    — student collaboration — PROTOTYPE\nLAB-03 Experiment 03     — visual systems — ONGOING`,
    log: ()=> `2025 → NOW   Event Lead, GDGoC ICEM\n2026 PUNE    Organizing Team, GDGoC WOW Pune\nDEC 2025     Functional Consultant Trainee, RumaSoft\nONGOING      Builder / Hackathon Finalist`,
    contact: ()=> `email: shriyaditta@gmail.com\nlinkedin: see nav → LINKEDIN`,
    coffee: ()=> `brewing...\nproductivity +1`,
    'sudo hire': ()=> `[ACCESS GRANTED]\n\ncandidate:\nSHRIYADITTA SHINDE\n\nrole fit:\nSDE / BACKEND / AI / GENAI\n\nnext step:\ncontact`,
    secret: ()=> `you found something that wasn't supposed to be here.`,
    matrix: ()=> `wake up, developer.`,
    neofetch: ()=> `guest@shriyaditta\n-----------------\nOS: SHRIYADITTA.EXE\nUptime: since 2024\nStack: Python, JS, C++\nInterests: AI, systems, art`,
    about: ()=> `A Computer Engineering student who builds backend systems and applied AI, and cares just as much about how it looks.`,
    why: ()=> `Because the problem was more interesting than the technology.`,
    art: ()=> `see the ARTIST SIDE section — instinct, not just training.`,
    clear: ()=> null
  };
  function runCommand(raw){
    const cmd = raw.trim();
    if (!cmd) return;
    termPrint(`<span class="term-hl">guest@shriyaditta:~$</span> <span class="term-cmd">${escapeHtml(cmd)}</span>`);
    if (cmd.toLowerCase() === 'clear'){ termOutput.innerHTML=''; return; }
    const fn = commands[cmd.toLowerCase()];
    if (fn){
      const out = fn();
      if (out) termPrint(escapeHtml(out).replace(/\n/g,'<br>'));
    } else {
      termPrint(`command not found: ${escapeHtml(cmd)} — type <span class="term-hl">help</span>`, 'term-err');
    }
  }
  function escapeHtml(str){
    return str.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  if (termInput){
    termInput.addEventListener('keydown', e=>{
      if (e.key === 'Enter'){
        runCommand(termInput.value);
        termInput.value = '';
      }
    });
    $('#terminalBox').addEventListener('click', ()=> termInput.focus());
  }

  /* ---------- CONTACT: COPY EMAIL ---------- */
  const copyBtn = $('#copyEmailBtn');
  if (copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText('shriyaditta@gmail.com');
        const original = copyBtn.textContent;
        copyBtn.textContent = 'COPIED ✓';
        setTimeout(()=> copyBtn.textContent = original, 1800);
      }catch(err){
        window.location.href = 'mailto:shriyaditta@gmail.com';
      }
    });
  }

})();
