import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistema Reprodutor Masculino — Experiência Interativa" },
      { name: "description", content: "Modelo anatômico interativo, simulação do percurso do espermatozoide, quiz, timeline da puberdade e dados científicos." },
    ],
  }),
  component: Index,
});

/* =========================================================
   DADOS CIENTÍFICOS
   ========================================================= */

type Organ = {
  id: string;
  name: string;
  function: string;
  curiosity: string;
  importance: string;
};

const ORGANS: Organ[] = [
  { id: "testiculos", name: "Testículos", function: "Produzem espermatozoides e o hormônio testosterona.", curiosity: "Trabalham 2–3 °C abaixo da temperatura corporal — por isso ficam no escroto.", importance: "Origem da fertilidade masculina e das características sexuais secundárias." },
  { id: "epididimo", name: "Epidídimo", function: "Armazena e amadurece os espermatozoides após a produção.", curiosity: "Tem cerca de 6 metros de tubos enrolados sobre cada testículo.", importance: "Sem maturação no epidídimo, o espermatozoide não consegue se mover ou fecundar." },
  { id: "deferente", name: "Canal deferente", function: "Transporta os espermatozoides do epidídimo até a uretra.", curiosity: "Mede aproximadamente 40 cm e tem contrações musculares potentes.", importance: "É o canal cortado na vasectomia." },
  { id: "vesiculas", name: "Vesículas seminais", function: "Produzem ~60% do líquido seminal, rico em frutose (energia).", curiosity: "A frutose é o 'combustível' dos espermatozoides.", importance: "Sem esse líquido, os espermatozoides teriam pouca energia para nadar." },
  { id: "prostata", name: "Próstata", function: "Produz líquido alcalino que neutraliza a acidez vaginal.", curiosity: "Tem aproximadamente o tamanho de uma noz no adulto jovem.", importance: "Protege os espermatozoides ao saírem do corpo." },
  { id: "bulbouretrais", name: "Glândulas bulbouretrais", function: "Secretam fluido lubrificante e neutralizam resíduos ácidos da uretra.", curiosity: "Também conhecidas como glândulas de Cowper.", importance: "Preparam a uretra para a passagem segura dos espermatozoides." },
  { id: "uretra", name: "Uretra", function: "Conduz urina e sêmen para fora do corpo.", curiosity: "É o único canal compartilhado entre o sistema urinário e reprodutor.", importance: "Mecanismo nervoso impede a saída simultânea de urina e sêmen." },
  { id: "penis", name: "Pênis", function: "Órgão copulador responsável por depositar o sêmen.", curiosity: "Composto por tecidos esponjosos que se enchem de sangue durante a ereção.", importance: "Permite a reprodução e a eliminação da urina." },
];

const TIMELINE_STEPS = [
  { id: "testiculos", title: "Produção", text: "Espermatogênese ocorre nos túbulos seminíferos dos testículos. Leva cerca de 64–74 dias." },
  { id: "epididimo", title: "Maturação", text: "Os espermatozoides ganham mobilidade e capacidade de fecundar no epidídimo." },
  { id: "deferente", title: "Transporte", text: "Contrações musculares do canal deferente impulsionam os espermatozoides em direção à uretra." },
  { id: "vesiculas", title: "Mistura", text: "Líquidos das vesículas seminais, próstata e bulbouretrais se misturam, formando o plasma seminal." },
  { id: "prostata", title: "Sêmen formado", text: "O conjunto espermatozoides + secreções forma o sêmen, pronto para a ejaculação." },
  { id: "uretra", title: "Ejaculação", text: "Contrações musculares expelem o sêmen pela uretra durante a ejaculação." },
];

const CURIOSIDADES = [
  { title: "≈ 100 milhões", text: "de espermatozoides produzidos por dia em um adulto saudável." },
  { title: "34–35 °C", text: "é a temperatura ideal dos testículos — abaixo da temperatura corporal." },
  { title: "3 a 5 dias", text: "é o tempo médio que um espermatozoide sobrevive no trato reprodutor feminino." },
  { title: "0,05 mm", text: "é o comprimento total de um espermatozoide humano." },
  { title: "≈ 64 dias", text: "é o tempo necessário para formar um espermatozoide completo." },
  { title: "1 em 100 milhões", text: "é, em média, a chance de um único espermatozoide fecundar o óvulo." },
];

const QUIZ = [
  { q: "Onde os espermatozoides são produzidos?", a: ["Próstata", "Testículos", "Epidídimo", "Uretra"], correct: 1 },
  { q: "Qual estrutura armazena e amadurece os espermatozoides?", a: ["Vesículas seminais", "Pênis", "Epidídimo", "Bulbouretrais"], correct: 2 },
  { q: "Qual é a principal função da próstata?", a: ["Produzir testosterona", "Produzir líquido alcalino", "Produzir espermatozoides", "Transportar urina"], correct: 1 },
  { q: "Qual hormônio é o principal produzido pelos testículos?", a: ["Estrogênio", "Insulina", "Testosterona", "Adrenalina"], correct: 2 },
  { q: "Por que os testículos ficam fora da cavidade abdominal?", a: ["Por estética", "Para manter temperatura mais baixa", "Para facilitar a urina", "Sem motivo"], correct: 1 },
  { q: "O canal deferente conecta o epidídimo a:", a: ["Pênis", "Próstata", "Uretra", "Vesículas"], correct: 2 },
  { q: "Quanto tempo leva, em média, para formar um espermatozoide?", a: ["1 dia", "1 semana", "≈ 64 dias", "6 meses"], correct: 2 },
  { q: "Qual fluido fornece energia ao espermatozoide?", a: ["Frutose das vesículas seminais", "Água da próstata", "Muco da uretra", "Linfa"], correct: 0 },
  { q: "O sêmen é formado por:", a: ["Apenas espermatozoides", "Espermatozoides + secreções glandulares", "Apenas líquido prostático", "Sangue e urina"], correct: 1 },
  { q: "A vasectomia consiste em cortar qual estrutura?", a: ["Uretra", "Epidídimo", "Canal deferente", "Pênis"], correct: 2 },
];

const PUBERDADE = [
  { age: "0–9 anos", title: "Infância", text: "Sistema reprodutor inativo. Níveis hormonais muito baixos." },
  { age: "9–11 anos", title: "Pré-puberdade", text: "Hipotálamo começa a liberar GnRH. Pequenos sinais hormonais." },
  { age: "11–13 anos", title: "Início da puberdade", text: "Crescimento testicular, primeiros pelos pubianos." },
  { age: "13–15 anos", title: "Mudanças hormonais", text: "Pico de testosterona, mudança de voz, crescimento ósseo acelerado." },
  { age: "15–17 anos", title: "Desenvolvimento físico", text: "Aumento da massa muscular, pelos faciais, espermarca." },
  { age: "18+ anos", title: "Fase adulta", text: "Sistema reprodutor plenamente funcional." },
];

const MITOS = [
  { q: "Andar de bicicleta reduz a fertilidade.", verdade: false, exp: "Não há evidência consistente; uso moderado é seguro." },
  { q: "Os testículos produzem espermatozoides a vida toda.", verdade: true, exp: "Diferente das mulheres, a produção continua, embora reduza com a idade." },
  { q: "Calor excessivo prejudica a produção de espermatozoides.", verdade: true, exp: "Temperaturas elevadas reduzem a espermatogênese." },
  { q: "Ejacular com frequência esgota o estoque de espermatozoides.", verdade: false, exp: "A produção é contínua; não existe 'estoque finito'." },
  { q: "A próstata tem o tamanho de uma noz.", verdade: true, exp: "No adulto jovem mede cerca de 3 cm." },
  { q: "Urina e sêmen saem juntos.", verdade: false, exp: "Um mecanismo nervoso impede a saída simultânea." },
];

/* =========================================================
   COMPONENTES
   ========================================================= */

const SECTIONS = [
  { id: "inicio", label: "Início" },
  { id: "anatomia", label: "Anatomia" },
  { id: "simulacao", label: "Simulação" },
  { id: "puberdade", label: "Puberdade" },
  { id: "curiosidades", label: "Curiosidades" },
  { id: "quiz", label: "Quiz" },
  { id: "referencias", label: "Referências" },
  { id: "estatisticas", label: "Estatísticas" },
];

function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-x-0 border-t-0">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a href="#inicio" className="flex items-center gap-2 font-display font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-cyan)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[color:var(--navy)]"><path d="M12 2v20M5 9l7-7 7 7" /></svg>
          </span>
          <span className="hidden sm:inline">Sistema Reprodutor Masculino</span>
        </a>
        <ul className="hidden lg:flex items-center gap-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={`px-3 py-2 rounded-md text-sm transition-all ${active === s.id ? "text-[color:var(--cyan)]" : "text-muted-foreground hover:text-foreground"}`}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <button aria-label="Menu" className="lg:hidden grid place-items-center h-9 w-9 rounded-md glass" onClick={() => setOpen(!open)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? "M6 6l12 12M6 18L18 6" : "M3 6h18M3 12h18M3 18h18"} /></svg>
        </button>
      </nav>
      {open && (
        <ul className="lg:hidden glass border-x-0 border-b-0 mx-0 px-6 py-3 flex flex-col gap-1 animate-fade-up">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-md text-sm ${active === s.id ? "text-[color:var(--cyan)]" : "text-muted-foreground"}`}>{s.label}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function Particles() {
  const dots = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {dots.map((d) => (
        <span key={d.id} className="absolute rounded-full animate-float" style={{
          left: `${d.left}%`, top: `${d.top}%`,
          width: d.size, height: d.size,
          background: "var(--cyan)",
          boxShadow: `0 0 ${d.size * 4}px var(--cyan)`,
          animationDelay: `${d.delay}s`,
          animationDuration: `${d.duration}s`,
          opacity: 0.5,
        }} />
      ))}
    </div>
  );
}

function Hero() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.3);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section id="inicio" className="relative min-h-screen flex items-center hero-bg pt-24 pb-16 overflow-hidden">
      <Particles />
      <div className="relative mx-auto max-w-5xl px-6 text-center" style={{ transform: `translateY(${offset}px)` }}>
        <span className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-muted-foreground animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--cyan)] animate-pulse" />
          Biologia · 3º ano · Projeto Interativo
        </span>
        <h1 className="mt-6 text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Sistema <span className="text-gradient">Reprodutor</span><br />Masculino
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Uma jornada visual pela anatomia, fisiologia e funcionamento do sistema responsável pela produção dos gametas masculinos e pela manutenção das características sexuais.
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.25s" }}>
          Trabalho da professora Cleide de biologia.<br/>
          Desenvolvido por: Pedro Henrique de Souza, Gabriel Henrique e Saulo Rodrigues.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <a href="#anatomia" className="btn-glow inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[color:var(--navy)] hover:scale-105 active:scale-95" style={{ background: "var(--gradient-cyan)" }}>
            Explorar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
          <a href="#quiz" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium glass hover:bg-white/10 transition">
            Fazer o Quiz
          </a>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
          {[
            { n: "8", l: "órgãos" },
            { n: "10", l: "perguntas" },
            { n: "6", l: "fases" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-4">
              <div className="text-3xl font-display font-semibold text-gradient">{s.n}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ANATOMIA — SVG INTERATIVO ---------- */

function Anatomy() {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = pinned ?? hover;
  const selected = ORGANS.find((o) => o.id === active);

  const baseStroke = "oklch(0.55 0.05 230)";
  const activeStroke = "oklch(0.88 0.18 200)";
  const dim = "oklch(0.35 0.04 245)";

  const getProps = (id: string) => ({
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(null),
    onClick: () => setPinned(pinned === id ? null : id),
    onFocus: () => setHover(id),
    tabIndex: 0,
    role: "button",
    "aria-label": ORGANS.find((o) => o.id === id)?.name,
    style: {
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      filter: active === id ? `drop-shadow(0 0 12px ${activeStroke})` : "none",
    } as React.CSSProperties,
  });

  const stroke = (id: string) => (active && active !== id ? dim : active === id ? activeStroke : baseStroke);
  const fill = (id: string) => (active === id ? "oklch(0.85 0.18 200 / 0.25)" : "oklch(0.30 0.05 240 / 0.4)");

  return (
    <section id="anatomia" className="relative py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Anatomia" title="Modelo Interativo" subtitle="Passe o mouse ou toque em cada órgão para descobrir sua função, importância e curiosidades." />

        <div className="mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          {/* SVG */}
          <div className="glass rounded-3xl p-6 sm:p-10 relative">
            <svg viewBox="0 0 400 520" className="w-full h-auto" aria-label="Diagrama do sistema reprodutor masculino">
              {/* Conexões/tubos suaves */}
              <defs>
                <linearGradient id="tubeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.45 0.08 220)" />
                  <stop offset="100%" stopColor="oklch(0.3 0.05 240)" />
                </linearGradient>
              </defs>

              {/* Bexiga (referência) */}
              <ellipse cx="200" cy="140" rx="55" ry="40" fill="oklch(0.25 0.03 245 / 0.5)" stroke="oklch(0.4 0.04 245)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="200" y="143" textAnchor="middle" fontSize="10" fill="oklch(0.6 0.03 240)">bexiga</text>

              {/* Vesículas seminais */}
              <g {...getProps("vesiculas")}>
                <path d="M165 175 Q150 165 145 185 Q150 200 170 195 Z" fill={fill("vesiculas")} stroke={stroke("vesiculas")} strokeWidth="2" />
                <path d="M235 175 Q250 165 255 185 Q250 200 230 195 Z" fill={fill("vesiculas")} stroke={stroke("vesiculas")} strokeWidth="2" />
              </g>

              {/* Próstata */}
              <g {...getProps("prostata")}>
                <ellipse cx="200" cy="210" rx="32" ry="22" fill={fill("prostata")} stroke={stroke("prostata")} strokeWidth="2" />
              </g>

              {/* Bulbouretrais */}
              <g {...getProps("bulbouretrais")}>
                <circle cx="178" cy="245" r="7" fill={fill("bulbouretrais")} stroke={stroke("bulbouretrais")} strokeWidth="2" />
                <circle cx="222" cy="245" r="7" fill={fill("bulbouretrais")} stroke={stroke("bulbouretrais")} strokeWidth="2" />
              </g>

              {/* Canal deferente */}
              <g {...getProps("deferente")}>
                <path d="M170 290 Q160 240 168 195" fill="none" stroke={stroke("deferente")} strokeWidth="3" strokeLinecap="round" />
                <path d="M230 290 Q240 240 232 195" fill="none" stroke={stroke("deferente")} strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Epidídimo */}
              <g {...getProps("epididimo")}>
                <path d="M155 320 Q140 340 150 380 Q155 395 168 395" fill="none" stroke={stroke("epididimo")} strokeWidth="3" strokeLinecap="round" />
                <path d="M245 320 Q260 340 250 380 Q245 395 232 395" fill="none" stroke={stroke("epididimo")} strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Testículos */}
              <g {...getProps("testiculos")}>
                <ellipse cx="170" cy="370" rx="28" ry="35" fill={fill("testiculos")} stroke={stroke("testiculos")} strokeWidth="2" />
                <ellipse cx="230" cy="370" rx="28" ry="35" fill={fill("testiculos")} stroke={stroke("testiculos")} strokeWidth="2" />
              </g>

              {/* Escroto */}
              <path d="M130 340 Q130 430 200 440 Q270 430 270 340" fill="none" stroke="oklch(0.35 0.04 245)" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Uretra + pênis */}
              <g {...getProps("uretra")}>
                <path d="M200 232 L200 295" stroke={stroke("uretra")} strokeWidth="3" strokeLinecap="round" />
              </g>
              <g {...getProps("penis")}>
                <path d="M180 295 Q170 360 175 450 Q200 470 225 450 Q230 360 220 295 Z" fill={fill("penis")} stroke={stroke("penis")} strokeWidth="2" strokeLinejoin="round" />
                <circle cx="200" cy="460" r="14" fill={fill("penis")} stroke={stroke("penis")} strokeWidth="2" />
              </g>

              {/* Labels com pontos pulsantes */}
              {ORGANS.map((o) => {
                const pts: Record<string, [number, number, number, number]> = {
                  testiculos: [200, 405, 350, 405],
                  epididimo: [150, 340, 60, 340],
                  deferente: [165, 250, 60, 250],
                  vesiculas: [148, 185, 60, 185],
                  prostata: [232, 210, 350, 210],
                  bulbouretrais: [222, 248, 350, 248],
                  uretra: [205, 280, 350, 280],
                  penis: [200, 460, 350, 460],
                };
                const p = pts[o.id];
                const isActive = active === o.id;
                return (
                  <g key={o.id} opacity={active && !isActive ? 0.3 : 1} style={{ transition: "opacity 0.3s" }}>
                    <line x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} stroke={isActive ? activeStroke : "oklch(0.4 0.04 245)"} strokeWidth="1" />
                    <circle cx={p[2]} cy={p[3]} r="3" fill={isActive ? activeStroke : "oklch(0.5 0.05 230)"} />
                  </g>
                );
              })}
            </svg>
            <p className="text-xs text-muted-foreground text-center mt-2">Diagrama esquemático · clique para fixar a seleção</p>
          </div>

          {/* Card lateral */}
          <div className="lg:sticky lg:top-24">
            <div key={selected?.id ?? "empty"} className="glass rounded-3xl p-8 animate-fade-up min-h-[400px]">
              {selected ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--cyan)] animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Órgão selecionado</span>
                  </div>
                  <h3 className="mt-4 text-3xl font-display font-semibold text-gradient">{selected.name}</h3>
                  <div className="mt-6 space-y-5">
                    <InfoBlock label="Função" text={selected.function} />
                    <InfoBlock label="Curiosidade" text={selected.curiosity} />
                    <InfoBlock label="Importância" text={selected.importance} />
                  </div>
                  {pinned && (
                    <button onClick={() => setPinned(null)} className="mt-6 text-xs text-muted-foreground hover:text-foreground underline">Desfixar seleção</button>
                  )}
                </>
              ) : (
                <div className="grid place-items-center h-full text-center text-muted-foreground py-20">
                  <div>
                    <div className="mx-auto h-14 w-14 rounded-full glass grid place-items-center mb-4">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4M12 16h.01" /><circle cx="12" cy="12" r="9" /></svg>
                    </div>
                    <p className="text-sm">Selecione um órgão no diagrama<br />para ver suas informações.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lista clicável de órgãos */}
            <div className="mt-6 grid grid-cols-2 gap-2">
              {ORGANS.map((o) => (
                <button key={o.id} onMouseEnter={() => setHover(o.id)} onMouseLeave={() => setHover(null)} onClick={() => setPinned(pinned === o.id ? null : o.id)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition glass hover:bg-white/10 ${active === o.id ? "ring-1 ring-[color:var(--cyan)] text-[color:var(--cyan)]" : ""}`}>
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <p className="mt-1.5 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--cyan)]">{eyebrow}</span>
      <h2 className="mt-3 text-4xl sm:text-5xl font-bold">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* ---------- TIMELINE PRODUÇÃO + SIMULAÇÃO ---------- */

function Production() {
  const [step, setStep] = useState(0);
  return (
    <section id="producao" className="py-24 px-6 bg-[color:var(--navy)]/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Fisiologia" title="Produção do Espermatozoide" subtitle="Clique em cada etapa para entender o caminho biológico completo, da espermatogênese à ejaculação." />

        <div className="mt-14 grid lg:grid-cols-[1fr_1.4fr] gap-8">
          <ol className="space-y-2">
            {TIMELINE_STEPS.map((s, i) => (
              <li key={s.id}>
                <button onClick={() => setStep(i)} className={`w-full text-left p-4 rounded-2xl transition flex gap-4 items-center ${step === i ? "glass ring-1 ring-[color:var(--cyan)]" : "hover:bg-white/5"}`}>
                  <span className={`shrink-0 grid place-items-center h-9 w-9 rounded-full text-sm font-semibold ${step === i ? "text-[color:var(--navy)]" : "bg-white/10"}`} style={step === i ? { background: "var(--gradient-cyan)" } : {}}>{i + 1}</span>
                  <span className="font-medium">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div key={step} className="glass rounded-3xl p-8 animate-fade-up">
            <div className="text-xs uppercase tracking-widest text-[color:var(--cyan)]">Etapa {step + 1} de {TIMELINE_STEPS.length}</div>
            <h3 className="mt-3 text-3xl font-display font-semibold">{TIMELINE_STEPS[step].title}</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">{TIMELINE_STEPS[step].text}</p>

            {/* Mini visual animado */}
            <div className="mt-8 h-40 rounded-2xl bg-black/30 overflow-hidden relative">
              <svg viewBox="0 0 400 160" className="w-full h-full">
                <line x1="20" y1="80" x2="380" y2="80" stroke="oklch(0.3 0.05 240)" strokeWidth="2" strokeDasharray="4 6" />
                {TIMELINE_STEPS.map((_, i) => (
                  <circle key={i} cx={20 + (360 / (TIMELINE_STEPS.length - 1)) * i} cy="80" r={i === step ? 10 : 5} fill={i === step ? "oklch(0.85 0.18 200)" : "oklch(0.45 0.05 230)"} style={{ transition: "all 0.4s" }} />
                ))}
                {/* espermatozoide animado */}
                <g style={{ transform: `translateX(${20 + (360 / (TIMELINE_STEPS.length - 1)) * step}px)`, transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
                  <ellipse cx="0" cy="50" rx="6" ry="4" fill="oklch(0.9 0.15 200)" />
                  <path d="M-6 50 Q-14 45 -20 52 Q-26 58 -32 50" fill="none" stroke="oklch(0.9 0.15 200)" strokeWidth="1.5" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Simulador */}
        <Simulator />
      </div>
    </section>
  );
}

function Simulator() {
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const stations = ORGANS.filter((o) => ["testiculos", "epididimo", "deferente", "vesiculas", "prostata", "uretra", "penis"].includes(o.id));
  const positions = [
    { x: 50, y: 280 }, // testiculos
    { x: 90, y: 230 }, // epididimo
    { x: 140, y: 170 }, // deferente
    { x: 180, y: 120 }, // vesiculas
    { x: 220, y: 130 }, // prostata
    { x: 260, y: 180 }, // uretra
    { x: 300, y: 270 }, // penis
  ];
  const done = idx >= stations.length;

  useEffect(() => {
    if (!running || done) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 2200);
    return () => clearTimeout(t);
  }, [running, idx, done]);

  const start = () => { setIdx(0); setRunning(true); };
  const reset = () => { setIdx(0); setRunning(false); };
  const current = stations[Math.min(idx, stations.length - 1)];
  const pos = positions[Math.min(idx, positions.length - 1)];

  return (
    <div id="simulacao" className="mt-24 grid lg:grid-cols-2 gap-8 items-center scroll-mt-24">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--cyan)]">Simulação</span>
        <h3 className="mt-3 text-4xl font-bold">Percurso do Espermatozoide</h3>
        <p className="mt-4 text-muted-foreground">Acompanhe em tempo real o caminho percorrido desde a produção até a ejaculação. A cada órgão, uma breve explicação aparece automaticamente.</p>

        <div className="mt-8 flex gap-3 flex-wrap">
          <button onClick={start} disabled={running && !done} className="btn-glow inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[color:var(--navy)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "var(--gradient-cyan)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            {done ? "Reiniciar" : running ? "Em execução..." : "Iniciar Simulação"}
          </button>
          {running && (
            <button onClick={reset} className="rounded-full px-6 py-3 glass text-sm">Parar</button>
          )}
        </div>

        <div key={`${running}-${idx}`} className="mt-8 glass rounded-2xl p-6 min-h-[140px] animate-fade-up">
          {!running && idx === 0 && <p className="text-muted-foreground text-sm">Pressione <strong className="text-foreground">Iniciar Simulação</strong> para começar.</p>}
          {running && !done && (
            <>
              <div className="text-xs uppercase tracking-widest text-[color:var(--cyan)]">Parada {idx + 1}/{stations.length}</div>
              <h4 className="mt-2 text-2xl font-display font-semibold">{current.name}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{current.function}</p>
            </>
          )}
          {done && (
            <div>
              <div className="text-2xl">🎉</div>
              <h4 className="mt-1 text-2xl font-display font-semibold text-gradient">Percurso concluído.</h4>
              <p className="mt-1 text-sm text-muted-foreground">O sêmen foi expelido pela uretra durante a ejaculação.</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 aspect-square sm:aspect-[4/3]">
        <svg viewBox="0 0 360 360" className="w-full h-full">
          {/* trajeto */}
          <path d="M50 280 Q70 250 90 230 Q115 200 140 170 Q160 145 180 120 Q200 125 220 130 Q240 155 260 180 Q280 225 300 270"
            fill="none" stroke="oklch(0.3 0.05 240)" strokeWidth="3" strokeLinecap="round" />
          {/* trajeto iluminado até idx */}
          {positions.slice(0, Math.min(idx + 1, positions.length)).map((p, i, arr) => i > 0 && (
            <line key={i} x1={arr[i - 1].x} y1={arr[i - 1].y} x2={p.x} y2={p.y} stroke="oklch(0.85 0.18 200)" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px oklch(0.85 0.18 200))" }} />
          ))}

          {/* estações */}
          {positions.map((p, i) => {
            const reached = i <= idx;
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={reached ? 9 : 6} fill={reached ? "oklch(0.85 0.18 200)" : "oklch(0.4 0.05 230)"} style={{ transition: "all 0.4s" }} />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="9" fill={reached ? "oklch(0.9 0.05 230)" : "oklch(0.55 0.03 240)"}>{stations[i]?.name}</text>
              </g>
            );
          })}

          {/* espermatozoide */}
          {running && !done && (
            <g style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)" }}>
              <circle r="14" fill="oklch(0.85 0.18 200 / 0.2)" className="animate-pulse-ring" />
              <ellipse cx="0" cy="0" rx="7" ry="5" fill="oklch(0.95 0.1 200)" />
              <path d="M-6 0 Q-14 -5 -20 2 Q-26 8 -32 0" fill="none" stroke="oklch(0.95 0.1 200)" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

/* ---------- PUBERDADE ---------- */

function Puberty() {
  return (
    <section id="puberdade" className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Desenvolvimento" title="Linha do Tempo da Puberdade" subtitle="Da infância à fase adulta, as principais transformações biológicas do organismo masculino." />

        <div className="mt-16 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-4">
          <div className="relative min-w-[900px]">
            <div className="absolute left-0 right-0 top-12 h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(0.85 0.18 200), transparent)" }} />
            <div className="grid grid-cols-6 gap-4">
              {PUBERDADE.map((p, i) => (
                <div key={p.title} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="mx-auto h-6 w-6 rounded-full grid place-items-center" style={{ background: "var(--gradient-cyan)", boxShadow: "0 0 16px oklch(0.85 0.18 200 / 0.6)" }}>
                    <div className="h-2 w-2 rounded-full bg-[color:var(--navy)]" />
                  </div>
                  <div className="mt-6 glass rounded-2xl p-5 text-left">
                    <div className="text-[11px] uppercase tracking-widest text-[color:var(--cyan)]">{p.age}</div>
                    <h4 className="mt-1 text-lg font-display font-semibold">{p.title}</h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparação de tamanhos */}
        <div className="mt-24">
          <SectionHeader eyebrow="Escala" title="Comparação de Tamanhos" subtitle="Para visualizar melhor as dimensões reais, comparamos cada estrutura com objetos do cotidiano." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { organ: "Testículo", obj: "Bola de pingue-pongue", size: "≈ 4 cm", svg: <circle cx="50" cy="50" r="28" /> },
              { organ: "Próstata", obj: "Noz", size: "≈ 3 cm", svg: <ellipse cx="50" cy="50" rx="24" ry="20" /> },
              { organ: "Vesícula seminal", obj: "Amêndoa", size: "≈ 5 cm", svg: <ellipse cx="50" cy="50" rx="30" ry="14" /> },
              { organ: "Espermatozoide", obj: "Invisível a olho nu", size: "≈ 0,05 mm", svg: <g><ellipse cx="45" cy="50" rx="6" ry="4" /><path d="M40 50 Q30 45 22 52 Q16 58 10 50" fill="none" stroke="currentColor" strokeWidth="1.5" /></g> },
            ].map((c, i) => (
              <div key={c.organ} className="glass rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="h-24 grid place-items-center text-[color:var(--cyan)]">
                  <svg viewBox="0 0 100 100" className="h-20 w-20" fill="currentColor">{c.svg}</svg>
                </div>
                <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{c.organ}</div>
                <div className="mt-1 font-display text-lg font-semibold">{c.obj}</div>
                <div className="mt-1 text-sm text-[color:var(--cyan)]">{c.size}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CURIOSIDADES + MITOS ---------- */

function Curiosities() {
  return (
    <section id="curiosidades" className="py-24 px-6 bg-[color:var(--navy)]/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Curiosidades" title="Você Sabia?" subtitle="Fatos científicos surpreendentes sobre o sistema reprodutor masculino." />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CURIOSIDADES.map((c, i) => (
            <div key={c.title} className="glass rounded-2xl p-7 hover:translate-y-[-4px] transition-transform animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="text-3xl font-display font-bold text-gradient">{c.title}</div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Mitos e Verdades */}
        <div className="mt-24">
          <SectionHeader eyebrow="Verifique" title="Mitos & Verdades" subtitle="Clique em cada cartão para descobrir o que é verdade científica e o que é mito." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MITOS.map((m, i) => <FlipCard key={i} {...m} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FlipCard({ q, verdade, exp }: { q: string; verdade: boolean; exp: string }) {
  const [flip, setFlip] = useState(false);
  return (
    <button onClick={() => setFlip(!flip)} className="relative h-48 w-full text-left" style={{ perspective: "1000px" }}>
      <div className="relative h-full w-full transition-transform duration-700" style={{ transformStyle: "preserve-3d", transform: flip ? "rotateY(180deg)" : "" }}>
        <div className="absolute inset-0 glass rounded-2xl p-6 flex flex-col justify-between" style={{ backfaceVisibility: "hidden" }}>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Mito ou verdade?</div>
          <p className="text-lg font-display font-medium">{q}</p>
          <div className="text-xs text-[color:var(--cyan)]">Clique para revelar →</div>
        </div>
        <div className="absolute inset-0 glass rounded-2xl p-6 flex flex-col justify-between" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: verdade ? "linear-gradient(135deg, oklch(0.3 0.1 180 / 0.3), oklch(0.2 0.05 240 / 0.3))" : "linear-gradient(135deg, oklch(0.3 0.15 25 / 0.3), oklch(0.2 0.05 240 / 0.3))" }}>
          <div className={`text-xs uppercase tracking-widest font-semibold ${verdade ? "text-[color:var(--cyan)]" : "text-destructive"}`}>{verdade ? "Verdade ✓" : "Mito ✗"}</div>
          <p className="text-sm leading-relaxed">{exp}</p>
        </div>
      </div>
    </button>
  );
}

/* ---------- QUIZ ---------- */

function Quiz() {
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const choose = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUIZ[i].correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < QUIZ.length) { setI(i + 1); setSelected(null); }
      else setDone(true);
    }, 900);
  };

  const reset = () => { setI(0); setSelected(null); setScore(0); setDone(false); };
  const pct = (i / QUIZ.length) * 100;

  return (
    <section id="quiz" className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow="Teste seu conhecimento" title="Quiz Interativo" subtitle={`${QUIZ.length} perguntas rápidas para fixar o conteúdo.`} />

        <div className="mt-12 glass rounded-3xl p-8 sm:p-10">
          {!done ? (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Pergunta {i + 1} / {QUIZ.length}</span>
                <span>Pontuação: {score}</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--gradient-cyan)" }} />
              </div>

              <h3 key={i} className="mt-8 text-2xl font-display font-semibold animate-fade-up">{QUIZ[i].q}</h3>
              <div className="mt-6 space-y-3">
                {QUIZ[i].a.map((opt, idx) => {
                  const isCorrect = selected !== null && idx === QUIZ[i].correct;
                  const isWrong = selected === idx && idx !== QUIZ[i].correct;
                  return (
                    <button key={idx} onClick={() => choose(idx)} disabled={selected !== null}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        isCorrect ? "border-[color:var(--cyan)] bg-[color:var(--cyan)]/10" :
                        isWrong ? "border-destructive bg-destructive/10" :
                        "border-white/10 hover:border-[color:var(--cyan)]/50 hover:bg-white/5"
                      }`}>
                      <span className="grid place-items-center h-7 w-7 rounded-full bg-white/10 text-xs font-semibold">{String.fromCharCode(65 + idx)}</span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 animate-fade-up">
              <div className="text-6xl mb-4">{score >= 8 ? "🏆" : score >= 5 ? "🎯" : "📚"}</div>
              <h3 className="text-3xl font-display font-bold text-gradient">{score} / {QUIZ.length}</h3>
              <p className="mt-3 text-muted-foreground">{
                score >= 8 ? "Excelente! Você domina o assunto." :
                score >= 5 ? "Bom trabalho! Revise os tópicos para melhorar ainda mais." :
                "Continue estudando — explore as seções novamente!"
              }</p>
              <button onClick={reset} className="mt-8 btn-glow inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-[color:var(--navy)] hover:scale-105" style={{ background: "var(--gradient-cyan)" }}>
                Refazer Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- REFERÊNCIAS ---------- */

function References() {
  return (
    <section id="referencias" className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow="Fontes" title="Referências Científicas" subtitle="Bibliografia e fontes utilizadas para a construção deste projeto." />
        <div className="mt-12 glass rounded-3xl p-8 sm:p-10">
          <ul className="space-y-4 text-sm sm:text-base text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-[color:var(--cyan)]">·</span>
              <span>Tortora, G. J.; Derrickson, B. <em>Princípios de Anatomia e Fisiologia</em>. 14ª ed.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[color:var(--cyan)]">·</span>
              <span>Guyton & Hall. <em>Tratado de Fisiologia Médica</em>. 13ª ed.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[color:var(--cyan)]">·</span>
              <span>Junqueira, L. C.; Carneiro, J. <em>Histologia Básica</em>.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[color:var(--cyan)]">·</span>
              <span>Organização Mundial da Saúde (OMS) — Saúde reprodutiva.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[color:var(--cyan)]">·</span>
              <span>Sociedade Brasileira de Urologia (SBU).</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- ESTATÍSTICAS ---------- */

function Stats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const testos = [
    { age: "10", v: 10 },
    { age: "15", v: 350 },
    { age: "20", v: 700 },
    { age: "30", v: 650 },
    { age: "40", v: 580 },
    { age: "50", v: 480 },
    { age: "60", v: 400 },
    { age: "70", v: 320 },
  ];
  const max = 800;

  return (
    <section id="estatisticas" ref={ref} className="py-24 px-6 bg-[color:var(--navy)]/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Dados" title="Estatísticas Visuais" subtitle="Números que dimensionam o funcionamento do sistema reprodutor masculino." />

        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {/* Big stats */}
          {[
            { label: "Espermatozoides/dia", target: 100, suffix: " milhões" },
            { label: "Dias para formação", target: 64, suffix: " dias" },
            { label: "Temperatura ideal", target: 34.5, suffix: " °C", decimals: 1 },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-8">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="mt-3 text-5xl font-display font-bold text-gradient">
                <Counter target={s.target} active={visible} decimals={s.decimals} />{s.suffix}
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="mt-10 glass rounded-3xl p-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-display font-semibold">Testosterona média por idade</h3>
              <p className="text-xs text-muted-foreground">Valores aproximados em ng/dL</p>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-4 rounded-full" style={{ background: "var(--gradient-cyan)" }} /> nível médio
            </div>
          </div>
          <div className="mt-8 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={testos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.85 0.18 200)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="oklch(0.85 0.18 200)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.3 0.05 240)" />
                <XAxis dataKey="age" tickFormatter={(v) => `${v} anos`} stroke="oklch(0.55 0.05 230)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.05 230)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(0.2 0.05 240 / 0.9)', borderColor: 'oklch(0.3 0.05 240)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: 'oklch(0.85 0.18 200)', fontWeight: 600 }}
                  formatter={(value: number) => [`${value} ng/dL`, 'Nível médio']}
                  labelFormatter={(label) => `Idade: ${label} anos`}
                />
                <Area type="monotone" dataKey="v" stroke="oklch(0.85 0.18 200)" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ target, active, decimals = 0 }: { target: number; active: boolean; decimals?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return <>{n.toFixed(decimals)}</>;
}

/* ---------- FOOTER ---------- */

function Footer() {
  return (
    <footer className="px-6 py-16 border-t border-white/5">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-cyan)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[color:var(--navy)]"><path d="M12 2v20M5 9l7-7 7 7" /></svg>
            </span>
            <span>Sistema Reprodutor Masculino</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">Projeto escolar interativo desenvolvido com foco em aprendizado visual e experiência de usuário.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--cyan)]">Navegação</div>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="hover:text-foreground transition">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl mt-12 pt-6 border-t border-white/5 text-xs text-muted-foreground flex flex-wrap justify-between gap-3">
        <span>© {new Date().getFullYear()} · Trabalho da professora Cleide de biologia.<br/>Desenvolvido por: Pedro Henrique de Souza, Gabriel Henrique e Saulo Rodrigues.</span>
        <span>Conteúdo educacional · não substitui orientação médica.</span>
      </div>
    </footer>
  );
}

/* ---------- INDEX ---------- */

function Index() {
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <Nav active={active} />
      <main>
        <Hero />
        <Anatomy />
        <Production />
        <Puberty />
        <Curiosities />
        <Quiz />
        <References />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
