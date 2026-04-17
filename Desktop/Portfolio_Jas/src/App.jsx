import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import SplitScroll from "./components/SplitScroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styled from "styled-components";

gsap.registerPlugin(ScrollTrigger);

function Burger({ open, setOpen }) {
  return (
    <StyledBurgerWrapper>
      <label className="hamburger" aria-label="Toggle menu">
        <input
          type="checkbox"
          checked={open}
          onChange={() => setOpen(!open)}
        />
        <svg viewBox="0 0 32 32">
          <path
            className="line line-top-bottom"
            d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          />
          <path className="line" d="M7 16 27 16" />
        </svg>
      </label>
    </StyledBurgerWrapper>
  );
}

Burger.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

const StyledBurgerWrapper = styled.div`
  .hamburger {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger input {
    display: none;
  }

  .hamburger svg {
    height: 2.7em;
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line {
    fill: none;
    stroke: #f5c8ad;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    transition:
      stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line-top-bottom {
    stroke-dasharray: 12 63;
  }

  .hamburger input:checked + svg {
    transform: rotate(-45deg);
  }

  .hamburger input:checked + svg .line-top-bottom {
    stroke-dasharray: 20 300;
    stroke-dashoffset: -32.42;
  }
`;

function HeroVideo() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
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

    try {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(v, 0, 0, 32, 32);
        const { data } = ctx.getImageData(0, 0, 32, 32);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        if (sum / (data.length / 4) > 160) {
          v.currentTime = 0;
          v.play();
          setProgress(0);
          return;
        }
      }
    } catch (e) {
      void e;
    }

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
      <canvas ref={canvasRef} width={42} height={20} className="hidden" />

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

      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-4">
        <div
          className="mb-3 h-[3px] w-full cursor-pointer rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8b0000] to-[#3a0000] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f5c8ad] backdrop-blur-sm transition hover:bg-[#b22222]/40 hover:text-white"
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
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f5c8ad] backdrop-blur-sm transition hover:bg-[#b22222]/40 hover:text-white"
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
  {
    id: "01",
    title: "Знакомство",
    text: "Погружаюсь в задачу, продукт и цели проекта, чтобы понять контекст и ожидания.",
  },
  {
    id: "02",
    title: "Анализ задачи",
    text: "Продумываю структуру интерфейса, пользовательский путь и технический подход.",
  },
  {
    id: "03",
    title: "UI Implementation",
    text: "Перевожу идею или дизайн в современный, чистый и выразительный интерфейс.",
  },
  {
    id: "04",
    title: "Frontend Development",
    text: "Собираю компоненты, состояния, интеграции и рабочую логику интерфейса.",
  },
  {
    id: "05",
    title: "Адаптация",
    text: "Делаю интерфейс адаптивным, плавным и удобным для разных устройств.",
  },
  {
    id: "06",
    title: "Запуск",
    text: "Финально полирую проект и подготавливаю его к уверенной презентации или релизу.",
  },
];

const projects = [
  {
    title: "CellMedicine",
    desc: "Разработан премиальный веб-сайт для медицинской индустрии, ориентированный на клиники и медицинские центры. Проект сочетает в себе современный UI/UX и высокую производительность.",
    tech: ["React", "TypeScript", "Tailwind", "i18n", "Framer-Motion", "GSAP"],
    image: "/image/cellmedicine.png",
    liveDemo: "https://cell-medicine.vercel.app/",
    github: "",
    details: {
      goal: "Создать премиальный мирового уровня сайт для медицинской индустрии, который усиливает доверие к бренду клиники, подчеркивает высокий уровень сервиса и презентует услуги на мировом уровне.",
      functionality: [
        "Премиальная презентация клиники и медицинских услуг",
        "Современный и чистый интерфейс для пациентов",
        "Адаптивный дизайн для всех устройств",
        "Удобная структура контента и навигации",
      ],
      result:
        "Получился сайт мирового уровня который занимается презентацией клиники и ее услуг, усиливает доверие пациентов и подчеркивает высокий уровень сервиса.",
    },
  },
  {
    title: "Landing ERP",
    desc: "Стильная и удобная панель управления с навигацией, фильтрами и reusable UI.",
    tech: ["React", "JavaScript", "Tailwind", "CSS"],
    image: "/image/lending.png",
    liveDemo: "https://oursystem.uz/",
    github: "",
    details: {
      goal: "Создать удобную и современную систему управления внутренними процессами.",
      functionality: [
        "Навигация по разделам",
        "Фильтрация и работа с данными",
        "Переиспользуемые UI-компоненты",
        "Адаптивная административная среда",
      ],
      result:
        "Интерфейс получился чистым, понятным и удобным для ежедневной работы.",
    },
  },
  {
    title: "E-commerce Website",
    desc: "Современный storefront с каталогом, карточками товаров и выразительной подачей.",
    tech: ["Next.js", "TypeScript", "Tailwind"],
    image: "/image/cellmedicine.png",
    liveDemo: "",
    github: "",
    details: {
      goal: "Сделать современный интернет-магазин с выразительной визуальной подачей.",
      functionality: [
        "Каталог товаров",
        "Карточки товаров",
        "Удобная навигация",
        "Адаптивный storefront",
      ],
      result:
        "Получился современный и визуально привлекательный e-commerce интерфейс.",
    },
  },
  {
    title: "Height-company",
    desc: "Интерфейс для работы с сотрудниками, задачами и внутренними процессами команды.",
    tech: ["React", "API", "TypeScript", "Tailwind", "CSS", "i18n", "Telegram Bot"],
    image: "/image/webSayt.png",
    liveDemo: "https://height-company.uz/",
    github: "",
    details: {
      goal: "Организовать удобное пространство для работы с клиентами,проектами и задачами.",
      functionality: [
        "Управление клиентами",
        "Работа с проектами и задачами",
        "Структурирование внутренних процессов",
        "Удобный UX для команды",
      ],
      result:
        "Веб-сайт который помогает организовать внутренние процессы команды и улучшить коммуникацию с клиентами чтобы легче было принимать решения и заказы.",
    },
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

function TypewriterHero() {
  const [l1, setL1] = useState("");
  const [l2, setL2] = useState("");
  const [onL1, setOnL1] = useState(true);
  const [onL2, setOnL2] = useState(false);

  useEffect(() => {
    const F1 = "Frontend";
    const F2 = "Developer";
    let active = true;
    let timer;

    const wait = (ms) =>
      new Promise((r) => {
        timer = setTimeout(r, ms);
      });

    async function run() {
      while (active) {
        setOnL1(true);
        setOnL2(false);

        for (let i = 1; i <= F1.length; i++) {
          if (!active) return;
          setL1(F1.slice(0, i));
          await wait(85);
        }

        await wait(150);
        setOnL1(false);
        setOnL2(true);

        for (let i = 1; i <= F2.length; i++) {
          if (!active) return;
          setL2(F2.slice(0, i));
          await wait(85);
        }

        await wait(2400);

        for (let i = F2.length - 1; i >= 0; i--) {
          if (!active) return;
          setL2(F2.slice(0, i));
          await wait(42);
        }

        await wait(150);
        setOnL1(true);
        setOnL2(false);

        for (let i = F1.length - 1; i >= 0; i--) {
          if (!active) return;
          setL1(F1.slice(0, i));
          await wait(42);
        }

        await wait(500);
      }
    }

    run();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const cur = <span className="tw-cursor" />;

  return (
    <>
      <div className="text-right font-black leading-[1.04] text-[#f7e3bf]">
        <div className="text-[60px] tracking-[0.05em] glav-title min-h-[1.15em]">
          {l1}
          {onL1 && cur}
        </div>
        <div className="text-[65px] tracking-[0.05em] glav-title min-h-[1.15em]">
          {l2 || "\u00A0"}
          {onL2 && cur}
        </div>
      </div>

      <div className="mt-6 text-right text-[17px] glav-title tracking-[0.28em] text-[#f6e7df]/85">
        Fast, scalable web apps. Clean code. Performance. Premium UX.
      </div>

      <div className="mt-8 space-y-4 text-right">
        <div className="text-2xl glav-title tracking-[0.10em] sm:text-3xl">
          Kuralova Jasmin
        </div>
        <p className="glav-title text-[17px] tracking-[0.050em] leading-7 text-[#f6e7df]">
          Создаю современные, быстрые и визуально сильные веб-интерфейсы
          с акцентом на UX, чистый код и сильный личный бренд.
        </p>
      </div>
    </>
  );
}

const ABOUT_ITEMS = [
  "• делаю адаптивную верстку",
  "• люблю работать с креативными проектами",
  "• создаю современные и необычные интерфейсы",
  "• уделяю внимание UI/UX, анимациям и производительности",
];

function TypewriterList() {
  const [lines, setLines] = useState(["", "", "", ""]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let active = true;
    let timer;

    const wait = (ms) =>
      new Promise((r) => {
        timer = setTimeout(r, ms);
      });

    async function run() {
      while (active) {
        for (let li = 0; li < ABOUT_ITEMS.length; li++) {
          if (!active) return;
          setActiveIdx(li);
          const str = ABOUT_ITEMS[li];

          for (let i = 1; i <= str.length; i++) {
            if (!active) return;
            setLines((prev) =>
              prev.map((v, idx) => (idx === li ? str.slice(0, i) : v))
            );
            await wait(38);
          }

          await wait(120);
        }

        setActiveIdx(-1);
        await wait(2200);

        for (let li = ABOUT_ITEMS.length - 1; li >= 0; li--) {
          if (!active) return;
          setActiveIdx(li);
          const str = ABOUT_ITEMS[li];

          for (let i = str.length - 1; i >= 0; i--) {
            if (!active) return;
            setLines((prev) =>
              prev.map((v, idx) => (idx === li ? str.slice(0, i) : v))
            );
            await wait(18);
          }

          await wait(80);
        }

        await wait(400);
      }
    }

    run();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <ul className="text-[18px] tracking-[0.08em] leading-9 text-[#f6e7df] glav-title text-center space-y-1">
      {ABOUT_ITEMS.map((_, i) => (
        <li key={i} className="min-h-[1.6em]">
          {lines[i]}
          {activeIdx === i && <span className="tw-cursor" />}
        </li>
      ))}
    </ul>
  );
}

const CATEGORIES = ["Веб-сайт", "Landing ERP", "ERP система", "Веб-сайт"];

function ProjectInfoCard({ project }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative h-full min-h-[400px] w-full [perspective:1600px]">
      <div
        className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="flex h-full flex-col justify-between p-7 lg:p-10">
            <div>
              <h3 className="text-[28px] font-semibold glav-title tracking-[0.06em] text-[#f7e3bf] leading-snug">
                {project.title}
              </h3>

              <p className="mt-3 text-[17px] glav-title leading-[1.8] tracking-[0.08em] text-[#f6e7df]">
                {project.desc}
              </p>
              <div className="text-[13px] pt-2 uppercase tracking-[0.2em] text-[#f5c8ad]">
                Технологии
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#8b0000]/50 bg-[#8b0000]/20 px-3 py-1 text-[12px] tracking-[0.08em] text-[#f5c8ad]/80 transition hover:border-[#b22222]/45 hover:text-[#f5c8ad]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {project.liveDemo && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tilt
                  className="rounded-[22px] bg-gradient-to-bl flex gap-2 from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:bg-[#b22222]/10 hover:text-white"
                >
                  <svg
                    className="mt-1.5"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10,8 16,12 10,16" />
                  </svg>
                  Live Demo
                </a>
              )}

              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tilt
                  className="rounded-[22px] bg-gradient-to-bl flex gap-2 from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:bg-[#b22222]/10 hover:text-white"
                >
                  <svg
                    className="mt-1.5"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.92.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              )}

              <button
                data-tilt
                onClick={() => setFlipped(true)}
                className="ml-auto rounded-[22px] bg-gradient-to-bl flex cursor-pointer items-center gap-2 from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:bg-[#b22222]/10 hover:text-white"
              >
                <img src="/image/menu.png" alt="" className="w-5 h-4 object-contain" />
                Подробнее
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex h-full flex-col justify-between p-7 lg:p-10">
            <div className="overflow-y-auto pr-1">
              <h3 className="text-[24px] font-semibold glav-title tracking-[0.06em] text-[#f7e3bf]">
                {project.title}
              </h3>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex">
                    <img src="/image/raketa.png" alt="" className="inline w-14 h-14 align-middle object-contain" />
                    <div className="text-[13px] uppercase tracking-[0.2em] text-[#f5c8ad]/70 mt-4">
                      Основная цель
                    </div>
                  </div>
                  <p className="mt-2 text-[15px] leading-[1.8] tracking-[0.05em] text-[#f6e7df]/80">
                    {project.details.goal}
                  </p>
                </div>

                <div>
                  <div className="flex">
                    <img src="/image/funk.png" alt="" className="w-12 h-12 object-contain" />
                    <div className="text-[13px] uppercase tracking-[0.2em] text-[#f5c8ad]/70 mt-3">
                      Функционал
                    </div>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {project.details.functionality.map((item) => (
                      <li
                        key={item}
                        className="text-[15px] leading-[1.75] tracking-[0.05em] text-[#f6e7df]/80"
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex">
                    <img src="/image/result.png" alt="" className="w-12 h-12 object-contain" />
                    <div className="text-[13px] uppercase tracking-[0.2em] text-[#f5c8ad]/70 mt-3">
                      Результат
                    </div>
                  </div>

                  <p className="mt-2 text-[15px] leading-[1.8] tracking-[0.05em] text-[#f6e7df]/80">
                    {project.details.result}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                data-tilt
                onClick={() => setFlipped(false)}
                className="rounded-[22px] bg-gradient-to-bl flex cursor-pointer items-center gap-2 from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:bg-[#b22222]/10 hover:text-white -mt-4"
              >
                Назад
                <img src="/image/close.png" alt="" className="w-[18px] h-[18px] object-contain flex-shrink-0 translate-y-[1px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProjectInfoCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    tech: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string.isRequired,
    liveDemo: PropTypes.string,
    github: PropTypes.string,
    details: PropTypes.shape({
      goal: PropTypes.string.isRequired,
      functionality: PropTypes.arrayOf(PropTypes.string).isRequired,
      result: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function ProjectsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = () => setCurrent((c) => (c - 1 + projects.length) % projects.length);
  const next = () => setCurrent((c) => (c + 1) % projects.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, current]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[1px]">
        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,rgba(75,0,0,0.97),rgba(35,0,0,0.99))]">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="w-full flex-shrink-0 lg:grid lg:grid-cols-2"
              >
                <div className="relative overflow-hidden h-64 lg:h-auto lg:min-h-[460px]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />

                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.28em] text-[#f5c8ad] rounded-[22px] bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-3 py-1 backdrop-blur-sm">
                    {CATEGORIES[index]}
                  </span>
                </div>

                <div className="min-h-[460px] bg-[linear-gradient(145deg,rgba(55,0,0,0.97),rgba(20,0,0,0.99))]">
                  <ProjectInfoCard project={project} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="group cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
      >
        <img
          src="/image/arrow_left.png"
          alt="prev"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:-translate-x-0.5"
        />
      </button>

      <button
        onClick={next}
        className="group cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
      >
        <img
          src="/image/arrow_right.png"
          alt="next"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </button>

      <div className="mt-5 flex items-center justify-center gap-4">
        <span className="text-[12px] tracking-[0.2em] text-[#f6e7df]/40 glav-title">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(projects.length).padStart(2, "0")}
        </span>

        <div className="flex gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current
                ? "w-7 h-3 bg-gradient-to-r from-[#5a0000] via-[#8b0000] to-[#b22222] shadow-[0_0_10px_rgba(178,34,34,0.35)]"
                : "w-3 h-3 bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] opacity-60 hover:opacity-100 hover:shadow-[0_0_8px_rgba(178,34,34,0.25)]"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessGrid() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const cards = Array.from(containerRef.current.querySelectorAll(".process-card"));

    const hoverCleanup = cards.map((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        gsap.to(card, {
          rotationY: dx * 14,
          rotationX: -dy * 9,
          duration: 0.35,
          ease: "power2.out",
          transformPerspective: 900,
          overwrite: "auto",
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
          transformPerspective: 900,
          overwrite: "auto",
        });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      return { card, onMove, onLeave };
    });

    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 320 + Math.random() * 180;
        gsap.set(card, {
          opacity: 0,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.55,
          rotation: gsap.utils.random(-50, 50),
          rotationY: gsap.utils.random(-70, 70),
          rotationX: gsap.utils.random(-30, 30),
          scale: gsap.utils.random(0.3, 0.6),
          filter: "blur(7px)",
          transformPerspective: 1000,
        });
      });

      gsap.to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.9,
        ease: "elastic.out(0.8, 0.55)",
        stagger: { each: 0.22, from: "random" },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, containerRef);

    return () => {
      hoverCleanup.forEach(({ card, onMove, onLeave }) => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid gap-3 sm:grid-cols-2"
      style={{ perspective: "1400px", perspectiveOrigin: "50% 40%" }}
    >
      {process.map((item) => (
        <div
          key={item.id}
          className="process-card rounded-[20px] bg-gradient-to-br from-[#700000] via-[#8b0000] to-[#230000] p-[1px] group cursor-default"
        >
          <div className="relative h-full overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,rgba(55,0,0,0.97),rgba(20,0,0,0.99))] p-5 transition-colors duration-500 group-hover:bg-[linear-gradient(145deg,rgba(88,0,0,0.97),rgba(40,0,0,0.99))]">
            <div className="shimmer" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-3">
                {item.id === "01" ? (
                  <img src="/image/bir.png" alt="01" className="w-12 h-12 object-contain flex-shrink-0" />
                ) : item.id === "02" ? (
                  <img src="/image/ikki.png" alt="02" className="w-14 h-14 object-contain flex-shrink-0" />
                ) : item.id === "03" ? (
                  <img src="/image/uch.png" alt="03" className="w-14 h-14 object-contain flex-shrink-0" />
                ) : item.id === "04" ? (
                  <img src="/image/tort.png" alt="04" className="w-14 h-14 object-contain flex-shrink-0" />
                ) : item.id === "05" ? (
                  <img src="/image/besh.png" alt="05" className="w-14 h-14 object-contain flex-shrink-0" />
                ) : (
                  <img src="/image/olti.png" alt="06" className="w-14 h-14 object-contain flex-shrink-0" />
                )}
                <div className="h-px flex-1 bg-gradient-to-r from-[#8b0000]/50 to-transparent transition-colors duration-400 group-hover:from-[#b22222]/40" />
              </div>
              <div className="text-[23px] text-center glav-title tracking-[0.05em] text-[#f6e7df] transition-colors duration-300 group-hover:text-white">
                {item.title}
              </div>
              <p className="mt-2 text-[18px] glav-title text-center leading-[1.72] text-[#f6e7df]/80 transition-colors duration-500 group-hover:text-[#f6e7df]/90">
                {item.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      label: "About me",
      id: "about",
      icon: <img src="/image/about.png" alt="" className="w-12 h-12 object-contain" />,
    },
    {
      label: "Projects",
      id: "projects",
      icon: <img src="/image/papka.png" alt="" className="w-8 h-8 object-contain" />,
    },
    {
      label: "Skills",
      id: "skills",
      icon: <img src="/image/skil.png" alt="" className="w-8 h-8 object-contain" />,
    },
    {
      label: "Contacts",
      id: "contact",
      icon: <img src="/image/kontakt.png" alt="" className="w-8 h-8 object-contain" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#3a0000] text-[#f6e7df] selection:bg-[#b22222] selection:text-white">
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mobile-menu-anim {
          animation: fadeInDown 0.35s ease;
        }
      `}</style>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#5a0000,#8b0000,#b22222)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.05),_transparent)]" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#4a0000]/40 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#5a0000]/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#b22222]/8 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#3a0000]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex gap-2">
            <a
              href="#hero"
              className="nik flex items-center gap-2 mt-3 text-[19px] font-semibold uppercase tracking-[0.35em] text-[#f5c8ad]"
            >
              <div className="brand">
                <img src="/image/vanessa.png" alt="" className="brandIcon object-contain" />
              </div>
            </a>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="relative flex items-center gap-1.5 px-4 py-2 text-[17px] text-[#f5c8ad] transition duration-300 hover:text-white
                before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2
                before:bg-[#8b0000] before:transition-all before:duration-300
                after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2
                after:rounded-full after:bg-[#b22222] after:transition-all after:duration-300
                hover:before:w-full hover:after:w-[75%]"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden cursor-pointer md:flex items-center gap-2">
              <img src="/image/perevod.png" alt="" className="icon object-contain" />
              <h1 className="text-[17px] -ml-4 text-[#f5c8ad]">Eng</h1>
            </button>

            <div className="md:hidden">
              <Burger open={menuOpen} setOpen={setMenuOpen} />
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu-anim border-t border-white/10 px-5 pb-5 md:hidden">
            <div className="mt-4 rounded-[22px] border border-[#8b0000]/40 bg-[#2a0000]/85 p-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-[16px] text-[#f5c8ad] transition hover:bg-white/5 hover:text-white"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                ))}

                <button className="mt-2 flex items-center gap-3 rounded-[16px] px-3 py-3 text-[16px] text-[#f5c8ad] transition hover:bg-white/5 hover:text-white">
                  <img src="/image/perevod.png" alt="" className="w-6 h-6 object-contain" />
                  <span>Eng</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1850px] px-1 pt-4 lg:px-4">
        <section
          id="hero"
          className="relative overflow-hidden rounded-[35px] border border-[#8b0000]/40 bg-[linear-gradient(135deg,rgba(90,0,0,0.90),rgba(58,0,0,0.95),rgba(38,0,0,0.98))] px-5 py-6 shadow-2xl shadow-black/30 lg:px-8 lg:py-8"
        >
          <div className="relative z-10 grid gap-90 lg:grid-cols-2">
            <HeroVideo />

            <div className="flex flex-col justify-end pt-8 lg:pt-8">
              <TypewriterHero />

              <div className="mt-3 flex flex-wrap justify-end gap-3">
                <a
                  href="#projects"
                  data-tilt
                  className="rounded-[22px] flex items-center gap-2 bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:text-white"
                >
                  View Projects
                  <img src="/image/papka.png" alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                </a>
                <a
                  href="#contact"
                  data-tilt
                  className="rounded-[22px] flex items-center gap-2 bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:text-white"
                >
                  My Contacts
                  <img src="/image/kontakt.png" alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                </a>
                <a
                  href="#cv"
                  data-tilt
                  className="rounded-[22px] flex items-center gap-2 bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#b22222] hover:text-white"
                >
                  Download CV
                  <img src="/image/skacat.png" alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="grid gap-5 lg:grid-cols-1">
          <div className="rounded-[28px] mt-22 bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[1px]">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(75,0,0,0.9),rgba(50,0,0,0.95))] p-5">
              <div>
                <div className="rounded-[22px] py-2 px-3">
                  <div className="glav-title font-bold text-[35px] tracking-[0.2em] glav-title">
                    <img src="/image/zvez.png" alt="" className="inline w-18 h-18 -mt-2 object-contain align-middle" />
                    <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8b0000] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#b22222] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">
                      About Me
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-8 mt-4">
                    <SplitScroll
                      mode="lines"
                      duration={0.85}
                      stagger={0.1}
                      start="top 85%"
                    >
                      <p className="text-[18px] max-w-[760px] tracking-[0.08em] leading-8 text-[#f6e7df] glav-title">
                        Я Frontend Developer. Люблю сильный UI/UX, фастастический
                        дизайн и современные digital-продукты. Создаю адаптивные
                        интерфейсы, которые выглядят премиально, работаю усердно и
                        оставляю ощущение эксклюзивности в своих созданных сайтах.
                      </p>
                    </SplitScroll>

                    <TypewriterList />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] mt-22 bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[1px]">
            <div
              id="process"
              className="rounded-[28px] bg-[linear-gradient(135deg,rgba(65,0,0,0.92),rgba(40,0,0,0.96))] p-6"
            >
              <div className="mb-6">
                <div className="mb-1 text-[29px] font-semibold tracking-[0.3em] glav-title">
                  <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8b0000] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#b22222] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">
                    <img src="/image/edit.png" alt="" className="inline w-18 h-18 object-contain align-middle" />
                    Этапы работы
                  </span>
                </div>
                <p className="text-[16px] glav-title text-[#f6e7df] tracking-[0.15em]">
                  <img src="/image/olti.png" alt="6" className="inline w-7 h-7 object-contain align-middle mr-1" />
                  шагов · от идеи до запуска
                </p>
              </div>

              <ProcessGrid />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-1 my-18">
          <img src="/image/papka.png" alt="" className="w-20 h-20 object-contain flex-shrink-0" />
          <SplitScroll
            mode="chars"
            duration={0.7}
            stagger={0.05}
            start="top 88%"
            className="text-[44px] text-center font-bold glav-title text-[#f6e7df]"
          >
            Projects
          </SplitScroll>
        </div>

        <section id="projects" className="mt-5">
          <ProjectsCarousel />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[1px]">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(95,0,0,0.92),rgba(50,0,0,0.98))] p-5">
              <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                <div className="relative flex before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8b0000] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#b22222] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">
                  <img src="/image/project.png" alt="" className="w-20 h-20 object-contain flex-shrink-0" />
                  <span className="mt-4">Другие работы</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherWorks.map((item, i) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-[#8b0000]/40 bg-white/5 p-3"
                  >
                    <div className="mb-3 h-24 rounded-[18px] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(139,0,0,0.10))]" />
                    <div className="text-sm font-medium">{item}</div>
                    <div className="mt-1 text-xs text-[#f6e7df]/55">
                      project #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-bl from-[#5a0000] via-[#8b0000] to-[#3a0000] p-[1px]">
            <div
              id="skills"
              className="rounded-[28px] bg-[linear-gradient(135deg,rgba(78,0,0,0.94),rgba(38,0,0,0.98))] p-5"
            >
              <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                <img src="/image/zvezda.png" alt="" className="inline object-contain flex-shrink-0 w-22 h-22 -mr-2" />
                <span className="relative inline-block before:absolute before:left-1/2 before:bottom-0.5 before:h-[0.5px] before:w-0 before:-translate-x-1/2 before:bg-[#8b0000] before:transition-all before:duration-300 after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#b22222] after:transition-all after:duration-300 hover:before:w-full hover:after:w-[75%]">
                  Skills
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2.5 rounded-[18px] border border-[#8b0000]/40 bg-white/5 px-3 py-3 text-sm text-[#f6e7df]/80 transition-all duration-300 hover:border-[#b22222]/45 hover:bg-[#b22222]/8 hover:text-[#f5c8ad] cursor-default"
                  >
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#8b0000] transition-colors duration-300 group-hover:bg-[#b22222]" />
                    {skill}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[20px] border border-[#b22222]/18 bg-[#b22222]/8 p-4">
                <div className="text-sm uppercase tracking-[0.24em] text-[#f5c8ad]">
                  Core Stack
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#b22222]/20 bg-white/5 px-3 py-1 text-xs text-[#f7e3bf]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="relative overflow-hidden rounded-[34px] border border-[#8b0000]/35 bg-[linear-gradient(135deg,#230000_0%,#3d0000_38%,#170000_100%)] px-5 py-6 md:px-7 md:py-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-[#b22222]/18 blur-3xl" />
              <div className="absolute right-[10%] top-[18%] h-52 w-52 rounded-full bg-[#f5c8ad]/[0.06] blur-3xl" />
              <div className="absolute bottom-[8%] left-[42%] h-44 w-44 rounded-full bg-[#8b0000]/18 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%)]" />
            </div>

            <div className="relative grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#b22222]/30 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#f5c8ad]/75">
                  <img src="/image/why.png" alt="" className="h-7 w-7 object-contain" />
                  Premium Frontend Presence
                </div>

                <h2 className="mt-5 max-w-[620px] text-[36px] font-black leading-[0.98] tracking-[-0.05em] text-[#fff1ea] sm:text-[48px] lg:text-[62px]">
                  Не просто
                  <span className="block bg-gradient-to-r from-[#f5c8ad] via-[#ffe0ca] to-[#b22222] bg-clip-text text-transparent">
                    красивый интерфейс
                  </span>
                </h2>

                <p className="mt-5 max-w-[580px] text-[16px] leading-8 tracking-[0.02em] text-[#f6e7df]/78 md:text-[17px]">
                  Я не просто собираю экраны. Я превращаю идею в сильный frontend-продукт:
                  с визуальным вкусом, продуманной структурой, аккуратной анимацией и
                  premium-подачей, которая цепляет с первого экрана.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {[
                    "Visual taste",
                    "Clean structure",
                    "Strong UX",
                    "Frontend performance",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#8b0000]/35 bg-white/[0.05] px-4 py-2 text-[12px] uppercase tracking-[0.18em] text-[#f5c8ad]/78"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#6d0000] via-[#8b0000] to-[#b22222] px-6 py-4 text-[15px] font-semibold tracking-[0.06em] text-[#fff4ee] shadow-[0_12px_35px_rgba(139,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(178,34,34,0.4)]"
                  >
                    Start a conversation
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </a>

                  <a
                    href="#projects"
                    className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-[#b22222]/35 bg-white/5 px-6 py-4 text-[15px] font-medium tracking-[0.05em] text-[#f5c8ad] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#b22222]/70 hover:bg-white/10 hover:text-white"
                  >
                    View projects
                  </a>
                </div>
              </div>

              <div className="relative z-10 min-h-[560px] [perspective:1800px]">
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b22222]/12 blur-3xl" />

                <div className="contact-stage relative mx-auto h-[560px] w-full max-w-[620px]">
                  <div className="contact-card contact-card-back absolute right-[12%] top-[8%] w-[250px] rounded-[28px] border border-[#8b0000]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-[#f5c8ad]/55">
                      Strength #01
                    </div>
                    <div className="mt-4 text-[24px] font-semibold leading-tight text-[#fff1ea]">
                      Strong visual
                      <span className="block text-[#f5c8ad]">taste</span>
                    </div>
                    <p className="mt-4 text-[14px] leading-7 text-[#f6e7df]/68">
                      Интерфейсы не выглядят шаблонно — они ощущаются как продукт с характером.
                    </p>
                  </div>

                  <div className="contact-card contact-card-main absolute left-1/2 top-1/2 w-full max-w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.38)] backdrop-blur-md">
                    <div className="overflow-hidden rounded-[24px] border border-[#8b0000]/25 bg-[linear-gradient(180deg,rgba(139,0,0,0.18),rgba(40,0,0,0.1))]">
                      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.28em] text-[#f5c8ad]/60">
                            Portfolio Identity
                          </div>
                          <div className="mt-1 text-[18px] font-semibold tracking-[0.04em] text-[#fff1ea]">
                            Jasmin Kuralova
                          </div>
                        </div>

                        <div className="rounded-full border border-[#b22222]/30 bg-[#b22222]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f5c8ad]">
                          Available
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#b22222]/12 to-transparent" />
                        <div className="mx-auto h-[420px] w-full max-w-[260px] overflow-hidden">
                          <img
                            src="/image/portfolio.png"
                            alt="Jasmin"
                            className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-[1.05]"
                          />
                        </div>
                      </div>

                      <div className="border-t border-white/8 px-4 py-4">
                        <div className="text-[12px] uppercase tracking-[0.24em] text-[#f6e7df]/45">
                          Frontend Developer · Premium digital interfaces
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute -left-4 top-10 rounded-full border border-[#f5c8ad]/12 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#f5c8ad]/80 backdrop-blur-sm">
                      React
                    </div>
                    <div className="pointer-events-none absolute -right-3 top-24 rounded-full border border-[#f5c8ad]/12 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#f5c8ad]/80 backdrop-blur-sm">
                      UI / UX
                    </div>
                    <div className="pointer-events-none absolute -left-2 bottom-20 rounded-full border border-[#f5c8ad]/12 bg-white/6 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#f5c8ad]/80 backdrop-blur-sm">
                      Frontend
                    </div>
                  </div>

                  <div className="contact-card contact-card-front absolute left-[10%] bottom-[10%] w-[270px] rounded-[28px] border border-[#8b0000]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-[#f5c8ad]/55">
                      Why hire me
                    </div>

                    <div className="mt-4 space-y-3">
                      {strengths.slice(0, 4).map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-[16px] border border-[#8b0000]/25 bg-white/[0.04] px-3 py-3"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#b22222]/25 bg-[#b22222]/10 text-[11px] text-[#f5c8ad]">
                            0{index + 1}
                          </div>
                          <div className="text-[14px] text-[#f6e7df]/82">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="contact-card contact-mini absolute right-[6%] bottom-[14%] w-[180px] rounded-[22px] border border-[#8b0000]/25 bg-white/[0.05] p-4 backdrop-blur-md">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[#f5c8ad]/50">
                      Collaboration
                    </div>
                    <div className="mt-3 text-[22px] font-semibold leading-tight text-[#fff1ea]">
                      Open for
                      <span className="block text-[#f5c8ad]">projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-16  ">
        <div className="relative overflow-hidden rounded-[30px] border border-[#8b0000]/25 bg-[linear-gradient(145deg,rgba(52,0,0,0.96),rgba(18,0,0,0.99))] px-6 py-10 md:px-10 md:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[10%] top-0 h-32 w-32 rounded-full bg-[#b22222]/10 blur-3xl" />
            <div className="absolute right-[8%] bottom-0 h-36 w-36 rounded-full bg-[#f5c8ad]/[0.04] blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="text-[30px] uppercase tracking-[0.32em] text-[#f5c8ad]">
              Why hire me
            </div>

            <p className="mt-5 text-[20px] leading-[1.9] tracking-[0.015em] text-[#f6e7df]/80 md:text-[24px]">
              Это портфолио не только про
              <span className="mx-1 text-[#fff1ea]">красивую подачу.</span>
              Оно показывает, что я умею превращать идею в
              <span className="mx-1 bg-gradient-to-r from-[#f5c8ad] via-[#ffe0ca] to-[#b22222] bg-clip-text font-medium text-transparent">
                сильный frontend-продукт
              </span>
              — с продуманной композицией, вниманием к деталям, современным UX
              и визуалом, который выглядит
              <span className="mx-1 text-[#fff1ea]">
                дороже обычного шаблонного решения.
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#f6e7df]/42">
              <span className="rounded-full border border-[#8b0000]/30 bg-white/[0.04] px-4 py-2">
                Premium UI
              </span>
              <span className="rounded-full border border-[#8b0000]/30 bg-white/[0.04] px-4 py-2">
                Strong UX
              </span>
              <span className="rounded-full border border-[#8b0000]/30 bg-white/[0.04] px-4 py-2">
                Clean Frontend
              </span>
            </div>

            <div className="mt-10 border-t border-white/10 pt-5 text-sm text-[#f6e7df]/45">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-semibold text-[#fff1ea]">JASMIN</span> — Frontend Developer
                </div>
                <div>Premium digital interfaces</div>
                <div>© 2026 All rights reserved.</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}