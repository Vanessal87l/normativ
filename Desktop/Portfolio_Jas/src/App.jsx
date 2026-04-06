
import { useRef, useState } from "react";

function HeroVideo() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !v.duration) return;

    // canvas brightness detection — skip white frames
    try {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(v, 0, 0, 32, 32);
        const { data } = ctx.getImageData(0, 0, 32, 32);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4)
          sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (sum / (data.length / 4) > 160) {
          v.currentTime = 0;
          v.play();
          setProgress(0);
          return;
        }
      }
    } catch (e) { void e; }

    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  return (
    <div className="relative min-h-125 overflow-hidden rounded-[28px]">
      <canvas ref={canvasRef} width={32} height={32} className="hidden" />

      <video
        ref={videoRef}
        src="/video/port2.mp4"
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* bottom fade into controls */}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />



      {/* Controls — overlaid at bottom */}
      <div className="absolute bottom-0 left-0 нright-0 z-10 px-4 pb-4 pt-8">
        {/* Progress bar */}
        <div
          className="mb-3 h-[3px] w-full cursor-pointer rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8f1020] to-[#2b0608] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f5c8ad] backdrop-blur-sm transition hover:bg-[#d36a2e]/40 hover:text-white"
          >
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="3" width="5" height="18" rx="1.5" />
                <rect x="14" y="3" width="5" height="18" rx="1.5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f5c8ad] backdrop-blur-sm transition hover:bg-[#d36a2e]/40 hover:text-white"
          >
            {muted ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17 18.7l1.97 1.97L20.24 19 4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>


        </div>
      </div>
    </div>
  );
}

const stack = [
  "React",
  "JavaScript",
  "TypeScript",
  "Bootstrap",
  "Zustand / Redux",
  "Tailwind CSS",
  "API",
  "Responsive Design",
  "GitHub",
  "Figma to Code",
];

const process = [
  { id: "01", title: "Знакомство", text: "Погружаюсь в задачу, продукт и цели проекта, чтобы понять контекст и ожидания." },
  { id: "02", title: "Анализ задачи", text: "Продумываю структуру интерфейса, пользовательский путь и технический подход." },
  { id: "03", title: "UI Implementation", text: "Перевожу идею или дизайн в современный, чистый и выразительный интерфейс." },
  { id: "04", title: "Frontend Development", text: "Собираю компоненты, состояния, интеграции и рабочую логику интерфейса." },
  { id: "05", title: "Адаптация", text: "Делаю интерфейс адаптивным, плавным и удобным для разных устройств." },
  { id: "06", title: "Запуск", text: "Финально полирую проект и подготавливаю его к уверенной презентации или релизу." },
];

const projects = [
  {
    title: "ERP Dashboard",
    desc: "Премиальный интерфейс для управления продажами, складом и аналитикой.",
    tech: ["React", "TypeScript", "Tailwind"],
  },
  {
    title: "Admin Panel",
    desc: "Стильная и удобная панель управления с навигацией, фильтрами и reusable UI.",
    tech: ["React", "REST API", "Responsive UI"],
  },
  {
    title: "E-commerce Website",
    desc: "Современный storefront с каталогом, карточками товаров и выразительной подачей.",
    tech: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    title: "CRM Interface",
    desc: "Интерфейс для работы с клиентами, задачами и внутренними процессами команды.",
    tech: ["React", "API", "TypeScript"],
  },
];

const otherWorks = [
  "Landing Page",
  "Analytics Dashboard",
  "Auth Pages",
  "Forms UI",
  "Mobile UI",
  "Component Library",
];

const skills = [
  "HTML",
  "CSS / SCSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Zustand / Redux",
  "REST API",
  "Git / GitHub",
  "Figma to Code",
  "Responsive Design",
];

const strengths = [
  "Современный UI",
  "Чистый код",
  "Адаптивная верстка",
  "Внимание к деталям",
  "Сильный визуальный вкус",
  "Хорошая frontend-реализация",
  "Производительность",
  "Понятный UX",
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#2b0608] text-[#f6e7df] selection:bg-[#d36a2e] selection:text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(142,18,28,0.45),_rgba(43,6,8,0.96)_55%)]" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#7b0f18]/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#5a0d13]/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#d36a2e]/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#2b0608]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#hero" className="nik text-[19px] font-semibold uppercase tracking-[0.35em] text-[#f5c8ad]">
            Vanessa
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              { label: "About me", id: "about" },
              { label: "Process", id: "process" },
              { label: "Projects", id: "projects" },
              { label: "Skills", id: "skills" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="relative px-4 py-2 text-[17px] text-[#f5c8ad] transition duration-300 hover:text-white
  before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2
  before:bg-[#8f1020] before:transition-all before:duration-300
  after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2
  after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300
  hover:before:w-full hover:after:w-[75%]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex gap-4">
            <button
              href="#contact"
              className="rounded-[22px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#d36a2e] hover:bg-[#d36a2e]/10 hover:text-white"
            >
              My Contacts
            </button>
            <button
              href="#contact"
              className="rounded-[22px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#d36a2e] hover:bg-[#d36a2e]/10 hover:text-white"
            >
              Eng
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1850px]  px-1  pt-4 lg:px-4">
        <section id="hero" className="relative overflow-hidden rounded-[35px] border border-[#8f1020]/40 bg-[linear-gradient(135deg,rgba(120,10,20,0.88),rgba(71,6,14,0.95),rgba(47,7,10,0.98))] px-5 py-6 shadow-2xl shadow-black/30 lg:px-8 lg:py-8">
          {/* <div className="absolute left-5 top-2 text-[88px] font-black leading-none tracking-[-0.012em] text-black/42 md:text-[128px]">
            Portfolio
          </div> */}

          <div className="relative z-10 grid gap-90 lg:grid-cols-2">
            <HeroVideo />

            <div className="flex flex-col justify-end pt-8 lg:pt-16">
              <div className="text-right text-[64px] font-black  leading-[1.04] text-[#f7e3bf] ">
                <div className="text-[60px] tracking-[0.05em] glav-title">Frontend</div>
                <div className="text-[65px] tracking-[0.05em] glav-title" >Developer</div>
              </div>

              <div className="mt-6 text-right text-[17px] glav-title tracking-[0.28em] text-[#f6e7df]/85">
                Fast, scalable web apps.
                Clean code. Performance. Premium UX.              </div>

              <div className="mt-20 space-y-3 text-right">
                <div className="text-2xl glav-title   tracking-[0.10em] sm:text-3xl">
                  Jasmin
                </div>

                <p className="ml-auto glav-title max-w-sm text-[17px] tracking-[0.050em] leading-7 text-[#f6e7df]">
                  Создаю современные, быстрые и визуально сильные веб-интерфейсы
                  с акцентом на UX, чистый код и сильный личный бренд.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <a href="#projects" className="rounded-[22px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#d36a2e] hover:bg-[#d36a2e]/10 hover:text-white"
                >
                  View Projects
                </a>
                <a href="#contact" className="rounded-[22px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#d36a2e] hover:bg-[#d36a2e]/10 hover:text-white"
                >
                  My Contacts
                </a>
                <a href="#" className="rounded-[22px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#d36a2e] hover:bg-[#d36a2e]/10 hover:text-white"
                >
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="  grid gap-5 lg:grid-cols-1">
          <div className="rounded-[28px] mt-22 bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(91,9,16,0.9),rgba(58,6,10,0.95))] p-5 ">
              <div>
                <div className="rounded-[22px] py-2 px-3">
                  <div className="glav-title font-bold text-[35px] tracking-[0.2em] glav-title">
                    <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">About Me</span>
                  </div>
                  <div className="flex items-start justify-between gap-8 mt-4">
                    <p className="text-[18px] max-w-[760px] tracking-[0.08em] leading-8 text-[#f6e7df] glav-title">
                      Я Frontend Developer. Люблю сильный UI/UX, фастастический дизайн и
                      современные digital-продукты. Создаю адаптивные интерфейсы,
                      которые выглядят премиально, работаю усердно   и оставляю
                      ощущение эксклюзивности в своих созданных сайтах.
                    </p>

                    <ul className=" text-[18px] tracking-[0.08em] leading-8 text-[#f6e7df] glav-title text-center">
                      <li>• делаю адаптивную верстку</li>
                      <li>• люблю работать с креативными проектами</li>
                      <li>• создаю современные и необычные интерфейсы</li>
                      <li className="w-[600px]">• уделяю внимание UI/UX, анимациям и производительности</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] mt-22 bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
            <div id="process" className="rounded-[28px] bg-[linear-gradient(135deg,rgba(81,8,14,0.92),rgba(49,5,9,0.96))] p-6">
              {/* header */}
              <div className="mb-6">
                <div className="mb-1 text-[29px] font-semibold tracking-[0.3em] glav-title">
                  <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">Этапы работы</span>
                </div>
                <p className="text-[16px] glav-title text-[#f6e7df] tracking-[0.15em] ">6 шагов · от идеи до запуска</p>
              </div>

              {/* grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {process.map((item, i) => (
                  <div
                    key={item.id}
                    className="process-card rounded-[20px] bg-gradient-to-br from-[#6e1019] via-[#8f1020] to-[#230407] p-[1px] group cursor-default"
                    style={{ animationDelay: `${i * 0.09}s` }}
                  >
                    <div className="relative h-full overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,rgba(65,7,13,0.97),rgba(26,2,5,0.99))] p-5 transition-colors duration-500 group-hover:bg-[linear-gradient(145deg,rgba(82,9,17,0.97),rgba(38,3,7,0.99))]">
                      {/* shimmer sweep */}
                      <div className="shimmer" />



                      <div className="relative">
                        {/* badge + line */}
                        <div className="mb-3 flex items-center gap-3">
                          <span className="flex h-[22px] min-w-[36px] items-center justify-center rounded-full border border-[#8f1020]/55 bg-[#8f1020]/20 px-2 text-[10.5px] font-bold tracking-wider text-[#d36a2e] transition-all duration-300 group-hover:border-[#d36a2e]/55 group-hover:bg-[#d36a2e]/12 group-hover:text-[#e8824a]">
                            {item.id}
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-[#8f1020]/50 to-transparent transition-colors duration-400 group-hover:from-[#d36a2e]/40" />
                        </div>

                        {/* title */}
                        <div className="text-[23px] text-center glav-title tracking-[0.05em] glav-title text-[#f6e7df] transition-colors duration-300 group-hover:text-white">
                          {item.title}
                        </div>

                        {/* desc */}
                        <p className="mt-2 text-[18px] glav-title text-center leading-[1.72] glav-title text-[#f6e7df]/80 transition-colors duration-500 group-hover:text-[#f6e7df]/78">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section >
        <div className="text-[44px] text-center font-semibold glav-title my-22 text-[#f6e7df]">Projects</div>
        <section id="projects" className="mt-5 grid gap-5 lg:grid-cols-2">
          {projects.map((project, index) => (
            <div key={project.title} className="rounded-[28px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
              <article
                className="rounded-[28px] bg-[linear-gradient(135deg,rgba(96,10,18,0.92),rgba(42,5,8,0.98))] p-4"
              >
                <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                  <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">
                    {index === 0 ? "Референсинг сайта" : project.title}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-[#8f1020]/40 bg-[#18090c] p-3">
                    <div className="rounded-[18px] border border-[#8f1020]/40 bg-[linear-gradient(180deg,#2c0f14,#0f090b)] p-3">
                      <div className="mb-3 h-4 w-24 rounded-full bg-[#d36a2e]/25" />
                      <div className="grid gap-2">
                        <div className="h-16 rounded-2xl bg-white/5" />
                        <div className="h-10 rounded-xl bg-white/5" />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-16 rounded-2xl bg-white/5" />
                          <div className="h-16 rounded-2xl bg-[linear-gradient(135deg,rgba(211,106,46,0.22),rgba(255,255,255,0.04))]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[#8f1020]/40 bg-white/5 p-4">
                    <div className="text-xl font-semibold glav-title tracking-[0.1em]">
                      <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">{project.title}</span>
                    </div>
                    <p className="mt-3 text-[17px] leading-7 text-[#f6e7df]/78">{project.desc}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tech.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[#d36a2e]/20 bg-[#d36a2e]/10 px-3 py-1 text-xs text-[#f5c8ad]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a href="#" className="rounded-full bg-[#f4e6d6] px-4 py-2 text-sm font-medium text-[#4d0910] transition hover:bg-white">
                        Live Demo
                      </a>
                      <a href="#" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(90,9,16,0.92),rgba(44,6,10,0.98))] p-5">
              <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">Другие работы</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherWorks.map((item, i) => (
                  <div key={item} className="rounded-[20px] border border-[#8f1020]/40 bg-white/5 p-3">
                    <div className="mb-3 h-24 rounded-[18px] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(211,106,46,0.12))]" />
                    <div className="text-sm font-medium">{item}</div>
                    <div className="mt-1 text-xs text-[#f6e7df]/55">project #{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
            <div id="skills" className="rounded-[28px] bg-[linear-gradient(135deg,rgba(72,8,13,0.94),rgba(35,5,8,0.98))] p-5">
              <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">Skills</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="rounded-[18px] border border-[#8f1020]/40 bg-white/5 px-3 py-3 text-sm text-[#f6e7df]/86"
                  >
                    {skill}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[20px] border border-[#d36a2e]/18 bg-[#d36a2e]/8 p-4">
                <div className="text-sm uppercase tracking-[0.24em] text-[#f5c8ad]">Core Stack</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#d36a2e]/20 bg-white/5 px-3 py-1 text-xs text-[#f7e3bf]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.52fr_0.48fr]">
          <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(84,9,15,0.94),rgba(37,5,8,0.98))] p-5">
              <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">Why Hire Me</span>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[#f6e7df]/80">
                Это портфолио не просто про красивую подачу. Оно показывает, что я
                умею собирать современные интерфейсы, чувствую визуальный стиль и
                могу превращать идею в сильный frontend-продукт.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {strengths.map((item) => (
                  <div key={item} className="rounded-[18px] border border-[#8f1020]/40 bg-white/5 p-4 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[1px]">
            <div id="contact" className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(122,14,24,0.86),rgba(69,8,13,0.94),rgba(40,6,9,0.98))] p-5">
              <div className="text-[44px] font-black leading-none tracking-[-0.05em] sm:text-[58px]">
                <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">Сотрудничество</span>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-[0.54fr_0.46fr]">
                <div>
                  <div className="rounded-[20px] border border-[#8f1020]/40 bg-white/8 p-4 text-sm leading-7 text-[#f6e7df]/82">
                    Ищу интересные проекты, сильную команду и возможность создавать
                    современные digital-продукты с выразительным визуалом и качественной frontend-реализацией.
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {["Telegram", "GitHub", "LinkedIn", "Email"].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="relative flex min-h-[96px] items-center justify-center rounded-[20px] border border-[#8f1020]/40 bg-white/6 text-sm font-medium transition hover:bg-white/10
  before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8f1020] before:transition-all before:duration-300
  after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300
  hover:before:w-[60%] hover:after:w-[45%]"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="h-56 w-56 rounded-full border border-[#8f1020]/40 overflow-hidden">
                    <img src="/image/portfolio.png" alt="Jasmin" className="h-full w-full object-cover object-top" />
                  </div>
                  <div className="mt-3 text-sm uppercase tracking-[0.28em] text-[#f6e7df]/72">Jasmin</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main >

      <footer className="mx-auto mt-4 max-w-7xl border-t border-white/10 px-4 py-6 text-sm text-[#f6e7df]/55 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-semibold text-white">MARINA</span> — Frontend Developer
          </div>
          <div>Premium feminine developer portfolio</div>
          <div>© 2026 All rights reserved.</div>
        </div>
      </footer>
    </div >
  );
}

