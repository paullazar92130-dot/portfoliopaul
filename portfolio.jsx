import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────
   REACT BITS — BlurText
   Chaque mot entre avec un blur→focus staggeré
───────────────────────────────────────── */
function BlurText({ text, className = "", delay = 0, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.28em" }}
          initial={{ opacity: 0, filter: "blur(12px)", y: 8 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.55, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────
   REACT BITS — SplitText
   Chaque caractère entre en stagger depuis le bas
───────────────────────────────────────── */
function SplitText({ text, className = "", delay = 0, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once });
  const chars = text.split("");
  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: "inline-block" }}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : "normal" }}
          initial={{ opacity: 0, y: "110%" }}
          animate={inView ? { opacity: 1, y: "0%" } : {}}
          transition={{ duration: 0.5, delay: delay + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────
   REACT BITS — CountUp
   Compte jusqu'au chiffre cible au scroll
───────────────────────────────────────── */
function CountUp({ to, suffix = "", duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * to));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────────────────────
   REACT BITS — ScrollReveal (AnimatedContent)
   Révèle un bloc au scroll avec slide + fade
───────────────────────────────────────── */
function ScrollReveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const initial = {
    up: { opacity: 0, y: 24 },
    left: { opacity: 0, x: -24 },
    right: { opacity: 0, x: 24 },
  }[direction];
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   REACT BITS — Aurora Background
   Gradient animé en arrière-plan du hero
───────────────────────────────────────── */
function Aurora() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, borderRadius: 0 }}>
      {[
        { color: "rgba(180,160,130,0.18)", x: "10%", y: "20%", size: "60%", dur: 14 },
        { color: "rgba(139,115,90,0.12)", x: "70%", y: "60%", size: "50%", dur: 18 },
        { color: "rgba(200,185,165,0.1)", x: "40%", y: "80%", size: "45%", dur: 22 },
      ].map((blob, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: blob.x, top: blob.y,
            width: blob.size, height: blob.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${blob.color}, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            filter: "blur(40px)",
          }}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: blob.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   REACT BITS — Magnet (hover attract)
   L'élément suit légèrement le curseur
───────────────────────────────────────── */
function Magnet({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   REACT BITS — ShinyText
   Reflet lumineux qui sweeps le texte
───────────────────────────────────────── */
function ShinyText({ text, className = "" }) {
  return (
    <span className={className} style={{ position: "relative", display: "inline-block", overflow: "hidden" }}>
      {text}
      <motion.span
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.55) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["-100% 0", "200% 0"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
    </span>
  );
}

/* ─────────────────────────────────────────
   STYLES (CSS-in-JS inline object)
───────────────────────────────────────── */
const CSS = {
  bg: "#f5f2ee",
  ink: "#1a1714",
  muted: "#8a8480",
  rule: "#d8d4ce",
  card: "#edeae5",
};

const s = {
  root: { background: CSS.bg, color: CSS.ink, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.6, WebkitFontSmoothing: "antialiased", overflowX: "hidden", minHeight: "100vh" },
  container: { maxWidth: 760, margin: "0 auto", padding: "0 1.5rem" },

  /* Nav */
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: CSS.bg, borderBottom: `1px solid ${CSS.rule}` },
  navInner: { display: "flex", justifyContent: "space-between", alignItems: "center", height: 56 },
  navLogo: { fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", letterSpacing: "-0.01em", color: CSS.ink, textDecoration: "none" },

  /* Hero */
  hero: { padding: "120px 0 90px", borderBottom: `1px solid ${CSS.rule}`, position: "relative", overflow: "hidden" },
  eyebrow: { display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.72rem", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: CSS.muted, marginBottom: "1.8rem" },
  eyebrowLine: { width: 28, height: 1, background: CSS.rule, flexShrink: 0 },
  h1: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.8rem, 9vw, 5rem)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "1.5rem", overflow: "hidden" },
  heroDesc: { maxWidth: 440, fontSize: "clamp(0.9rem, 2.5vw, 1rem)", color: CSS.muted, lineHeight: 1.75, marginBottom: "2.2rem" },
  heroActions: { display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.83rem", fontWeight: 500, color: CSS.ink, textDecoration: "none", borderBottom: `1px solid ${CSS.ink}`, paddingBottom: 2 },
  btnQuiet: { fontSize: "0.83rem", color: CSS.muted, textDecoration: "none" },

  /* Section */
  section: { padding: "70px 0", borderBottom: `1px solid ${CSS.rule}` },
  sectionHeader: { display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "2.5rem" },
  sectionNum: { fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: CSS.muted, fontWeight: 400, flexShrink: 0 },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.3rem, 4vw, 1.6rem)", fontWeight: 400, letterSpacing: "-0.02em" },

  /* About */
  aboutGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" },
  aboutP: { fontSize: "0.92rem", color: CSS.muted, lineHeight: 1.8, marginBottom: "0.9rem" },
  metaRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.9rem 0", borderBottom: `1px solid ${CSS.rule}`, gap: "1rem" },
  metaKey: { fontSize: "0.72rem", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", color: CSS.muted, flexShrink: 0 },
  metaVal: { fontSize: "0.88rem", fontWeight: 400, color: CSS.ink, textAlign: "right" },

  /* Stats */
  statNum: { fontSize: "2rem", fontWeight: 800, color: CSS.ink, lineHeight: 1, fontFamily: "'DM Serif Display', serif" },
  statLabel: { fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: CSS.muted, marginTop: "0.2rem" },

  /* Skills */
  skillItem: { display: "flex", alignItems: "center", padding: "1rem 0", borderBottom: `1px solid ${CSS.rule}`, gap: "1.2rem" },
  skillName: { fontSize: "0.9rem", fontWeight: 400, minWidth: 56 },
  skillTrack: { flex: 1, height: 1, background: CSS.rule, position: "relative", borderRadius: 1 },
  skillLevel: { fontSize: "0.72rem", color: CSS.muted, minWidth: 76, textAlign: "right" },

  /* Projects */
  projectItem: { display: "grid", gridTemplateColumns: "28px 1fr 20px", gap: "0 1.2rem", alignItems: "start", padding: "1.8rem 0", borderBottom: `1px solid ${CSS.rule}`, textDecoration: "none", color: CSS.ink, cursor: "default" },
  projectIdx: { fontSize: "0.68rem", color: CSS.muted, fontWeight: 400, paddingTop: 4 },
  projectName: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)", fontWeight: 400, letterSpacing: "-0.01em", marginBottom: "0.4rem" },
  projectDesc: { fontSize: "0.83rem", color: CSS.muted, lineHeight: 1.65 },
  tagsRow: { display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.75rem" },
  tag: { fontSize: "0.67rem", letterSpacing: "0.06em", textTransform: "uppercase", color: CSS.muted, background: CSS.card, padding: "0.22rem 0.55rem", borderRadius: 2 },
  projectArrow: { fontSize: "1rem", color: CSS.rule, paddingTop: 3, transition: "color 0.2s" },

  /* Contact */
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" },
  contactLink: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1rem 0", borderBottom: `1px solid ${CSS.rule}`, textDecoration: "none", color: CSS.ink, minHeight: 48 },
  contactLabel: { fontSize: "0.85rem", fontWeight: 400, flexShrink: 0 },
  contactUrl: { fontSize: "0.72rem", color: CSS.muted, textAlign: "right", wordBreak: "break-all" },

  /* Footer */
  footer: { padding: "1.8rem 0" },
  footerInner: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" },
  footerText: { fontSize: "0.72rem", color: CSS.muted },
  footerLink: { fontSize: "0.72rem", color: CSS.muted, textDecoration: "none" },
};

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const SKILLS = [
  { name: "HTML5", pct: 75, level: "Intermédiaire" },
  { name: "CSS3",  pct: 65, level: "Intermédiaire" },
  { name: "Java",  pct: 55, level: "Débutant+" },
  { name: "Git",   pct: 40, level: "Débutant" },
];

const PROJECTS = [
  { idx: "01", name: "Site Web HTML / CSS", desc: "Conception d'un site structuré avec une attention portée à la sémantique, la mise en page et la compatibilité multi-écrans.", tags: ["HTML", "CSS"] },
  { idx: "02", name: "Flappy Bird", desc: "Recréation du jeu culte en Java — gestion de la gravité, des collisions, des obstacles générés aléatoirement et du score.", tags: ["Java", "POO", "Game Dev"] },
  { idx: "03", name: "Animations CSS", desc: "Exploration des transitions, keyframes et effets CSS pour enrichir l'interface et l'expérience utilisateur.", tags: ["CSS", "Animation"] },
];

/* ─────────────────────────────────────────
   SKILL BAR — animé au scroll
───────────────────────────────────────── */
function SkillBar({ name, pct, level, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} style={{ ...s.skillItem, ...(name === "HTML5" ? { borderTop: `1px solid ${CSS.rule}` } : {}) }}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span style={s.skillName}>{name}</span>
      <div style={s.skillTrack}>
        <motion.div
          style={{ position: "absolute", top: 0, left: 0, height: 1, background: CSS.ink, borderRadius: 1 }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.3, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span style={s.skillLevel}>{level}</span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   PROJECT ITEM — hover
───────────────────────────────────────── */
function ProjectItem({ p, i }) {
  const [hov, setHov] = useState(false);
  return (
    <ScrollReveal delay={i * 0.08}>
      <motion.div
        style={{ ...s.projectItem, ...(i === 0 ? { borderTop: `1px solid ${CSS.rule}` } : {}), opacity: hov ? 0.45 : 1, transition: "opacity 0.2s" }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <span style={s.projectIdx}>{p.idx}</span>
        <div>
          <div style={s.projectName}>{p.name}</div>
          <p style={s.projectDesc}>{p.desc}</p>
          <div style={s.tagsRow}>{p.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}</div>
        </div>
        <span style={{ ...s.projectArrow, color: hov ? CSS.muted : CSS.rule }}>↗</span>
      </motion.div>
    </ScrollReveal>
  );
}

/* ─────────────────────────────────────────
   NAV — hamburger mobile
───────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [["#about","Profil"],["#skills","Skills"],["#projects","Projets"],["#contact","Contact"]];
  const close = () => setOpen(false);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        .navlinks a{font-size:0.78rem;font-weight:400;letter-spacing:0.08em;text-transform:uppercase;color:${CSS.muted};text-decoration:none;transition:color 0.2s}
        .navlinks a:hover{color:${CSS.ink}}
        .burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px}
        .burger span{display:block;width:22px;height:1px;background:${CSS.ink};transition:all 0.25s}
        .contact-link-hover{transition:opacity 0.2s}.contact-link-hover:hover{opacity:0.5}
        .footer-link-hover{transition:color 0.2s}.footer-link-hover:hover{color:${CSS.ink}}
        @media(max-width:600px){
          .navlinks{display:none!important}
          .burger{display:flex!important}
          .about-grid{grid-template-columns:1fr!important}
          .contact-grid{grid-template-columns:1fr!important}
          .project-arrow{display:none!important}
          .project-item-grid{grid-template-columns:24px 1fr!important}
        }
        @media(min-width:601px) and (max-width:860px){
          .about-grid{grid-template-columns:1fr!important}
          .contact-grid{grid-template-columns:1fr!important}
        }
      `}</style>
      <nav style={s.nav}>
        <div style={{ ...s.container, ...s.navInner }}>
          <a href="#" style={s.navLogo}>Paul Lazar</a>
          <ul className="navlinks" style={{ display: "flex", gap: "1.5rem", listStyle: "none" }}>
            {links.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
          </ul>
          <button className="burger" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <motion.span animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} />
            <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} />
            <motion.span animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", top: 56, left: 0, right: 0, bottom: 0, background: CSS.bg, zIndex: 99, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "2.5rem" }}
          >
            {links.map(([href, label], i) => (
              <motion.a key={href} href={href} onClick={close}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                transition={{ delay: i * 0.06 }}
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.2rem", fontWeight: 400, color: CSS.ink, textDecoration: "none" }}
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
export default function Portfolio() {
  return (
    <div style={s.root}>
      <Nav />

      {/* HERO */}
      <div style={s.hero}>
        <Aurora />
        <div style={{ ...s.container, position: "relative", zIndex: 1 }}>
          <motion.div style={s.eyebrow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <span style={s.eyebrowLine} />
            BTS SIO SLAM — 1ère année
          </motion.div>

          <h1 style={s.h1}>
            <div style={{ overflow: "hidden", display: "block" }}>
              <SplitText text="Développeur" delay={0.1} />
            </div>
            <div style={{ overflow: "hidden", display: "block" }}>
              <SplitText text="en devenir." delay={0.4} />
            </div>
          </h1>

          <BlurText
            text="J'apprends à construire des choses avec du code — des interfaces web soignées aux mini-jeux en Java. Passionné par la logique et le design."
            className=""
            delay={0.7}
          />
          <div style={{ height: "1.5rem" }} />

          <motion.div style={s.heroActions} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.5 }}>
            <Magnet strength={0.25}>
              <a href="#projects" style={s.btnPrimary}>
                <ShinyText text="Voir mes projets →" />
              </a>
            </Magnet>
            <a href="#contact" style={s.btnQuiet}>Me contacter</a>
          </motion.div>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={s.section}>
        <div style={s.container}>
          <ScrollReveal>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>01</span>
              <h2 style={s.sectionTitle}>Profil</h2>
            </div>
          </ScrollReveal>
          <div className="about-grid" style={s.aboutGrid}>
            <ScrollReveal delay={0.1}>
              <p style={s.aboutP}>Je suis <strong style={{ color: CSS.ink, fontWeight: 500 }}>Paul Lazar</strong>, étudiant en <strong style={{ color: CSS.ink, fontWeight: 500 }}>BTS SIO option SLAM</strong> en première année. Le développement m'attire depuis longtemps — j'aime comprendre comment les choses fonctionnent et les construire moi-même.</p>
              <p style={s.aboutP}>Mon objectif : progresser continuellement, explorer de nouveaux langages et contribuer à des projets qui ont du sens.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                {[["Formation","BTS SIO SLAM"],["Année","1ère année"],["Projets","3 réalisés"],["Disponibilité","Stage à venir"]].map(([k,v], i) => (
                  <div key={k} style={{ ...s.metaRow, ...(i === 0 ? { borderTop: `1px solid ${CSS.rule}` } : {}) }}>
                    <span style={s.metaKey}>{k}</span>
                    <span style={s.metaVal}>{v}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={s.section}>
        <div style={s.container}>
          <ScrollReveal>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>02</span>
              <h2 style={s.sectionTitle}>Compétences</h2>
            </div>
          </ScrollReveal>
          {SKILLS.map((sk, i) => <SkillBar key={sk.name} {...sk} delay={i * 0.1} />)}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={s.section}>
        <div style={s.container}>
          <ScrollReveal>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>03</span>
              <h2 style={s.sectionTitle}>Projets</h2>
            </div>
          </ScrollReveal>
          {PROJECTS.map((p, i) => <ProjectItem key={p.idx} p={p} i={i} />)}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={s.section}>
        <div style={s.container}>
          <ScrollReveal>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>04</span>
              <h2 style={s.sectionTitle}>Contact</h2>
            </div>
          </ScrollReveal>
          <div className="contact-grid" style={s.contactGrid}>
            <ScrollReveal delay={0.1}>
              <p style={{ ...s.aboutP, marginBottom: 0 }}>Une question, une opportunité de stage, ou simplement envie d'échanger ? N'hésitez pas à m'écrire.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                {[
                  { label: "Email", url: "paullazar92130@gmail.com", href: "mailto:paullazar92130@gmail.com" },
                  { label: "LinkedIn", url: "linkedin.com/in/paul-lazar", href: "https://www.linkedin.com/in/paul-lazar-08548a291" },
                  { label: "GitHub", url: "github.com/paullazar", href: "https://github.com" },
                ].map(({ label, url, href }, i) => (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener"
                    className="contact-link-hover"
                    style={{ ...s.contactLink, ...(i === 0 ? { borderTop: `1px solid ${CSS.rule}` } : {}) }}>
                    <span style={s.contactLabel}>{label}</span>
                    <span style={s.contactUrl}>{url}</span>
                  </a>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{ ...s.container, ...s.footerInner }}>
          <span style={s.footerText}>© 2026 Paul Lazar</span>
          <span style={s.footerText}>BTS SIO SLAM</span>
          <a href="https://www.linkedin.com/in/paul-lazar-08548a291" target="_blank" rel="noopener"
            className="footer-link-hover"
            style={s.footerLink}>
            LinkedIn ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
