
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
            {["About me", "Process", "Projects", "Skills"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative px-4 py-2 text-[17px] text-[#f5c8ad] transition duration-300 hover:text-white
  before:absolute before:left-1/2 before:bottom-[2px] before:h-[0.5px] before:w-0 before:-translate-x-1/2
  before:bg-[#8f1020] before:transition-all before:duration-300
  after:absolute after:left-1/2 after:bottom-0 after:h-[0.5px] after:w-0 after:-translate-x-1/2
  after:rounded-full after:bg-[#d36a2e] after:transition-all after:duration-300
  hover:before:w-full hover:after:w-[75%]"
              >
                {item}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="rounded-[22px] bg-gradient-to-bl from-[#5a0d13] via-[#8f1020] to-[#2b0608] p-[2px] shadow-[inset_1px_1px_0_rgba(255,255,255,0.08)] border border-white/5 px-4 py-2 text-[17px] text-[#f5c8ad] transition hover:border-[#d36a2e] hover:bg-[#d36a2e]/10 hover:text-white"
          >
            Contact Me
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1850px] px-4 pb-10 pt-6 lg:px-8">
        <section id="hero" className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(120,10,20,0.88),rgba(71,6,14,0.95),rgba(47,7,10,0.98))] px-5 py-6 shadow-2xl shadow-black/30 lg:px-8 lg:py-8">
          <div className="absolute left-4 top-2 text-[17vw] font-black leading-none tracking-[-0.09em] text-black/45 md:text-[11vw]">
            Portfolio
          </div>

          <div className="relative z-10 grid gap-6 lg:grid-cols-[0.18fr_0.47fr_0.35fr]">
            <div className="flex flex-col justify-center pt-10 lg:pt-20">
              <div className="space-y-1 text-4xl font-extrabold uppercase leading-none tracking-tight text-[#f4e6d6] sm:text-5xl">
                <div>UX</div>
                <div>UI</div>
                <div>WEB</div>
              </div>

              <div className="mt-8 space-y-2 text-xs text-[#f6e7df]/65">
                <div>inst: marina.dev</div>
                <div>tg: @marina_front</div>
              </div>
            </div>

            <div className="relative flex min-h-[420px] items-end justify-center">
              <div className="absolute inset-x-10 bottom-4 top-12 rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,228,213,0.36),rgba(255,208,185,0.08),transparent_65%)] blur-xl" />
              <div className="relative h-[420px] w-[300px] overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] shadow-2xl shadow-black/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,195,0.25),transparent_45%)]" />
                <div className="absolute left-1/2 top-[16%] h-24 w-24 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#a31222,#2b0608)]" />
                <div className="absolute left-1/2 top-[24%] h-10 w-32 -translate-x-1/2 rounded-full border border-[#f0e4da]/40" />
                <div className="absolute left-[33%] top-[25.5%] h-7 w-7 rounded-full border border-[#f0e4da]/50" />
                <div className="absolute right-[33%] top-[25.5%] h-7 w-7 rounded-full border border-[#f0e4da]/50" />
                <div className="absolute left-1/2 top-[26.8%] h-[1px] w-10 -translate-x-1/2 bg-[#f0e4da]/50" />
                <div className="absolute left-1/2 top-[31%] h-3 w-16 -translate-x-1/2 rounded-full bg-[#f2c2b2]/25" />
                <div className="absolute left-1/2 top-[35%] h-6 w-8 -translate-x-1/2 rounded-b-full bg-[#1f0709]" />
                <div className="absolute left-1/2 top-[38%] h-[170px] w-[185px] -translate-x-1/2 rounded-t-[80px] rounded-b-[26px] bg-[linear-gradient(180deg,#171012,#080607)]" />
                <div className="absolute left-[14%] top-[8%] h-[210px] w-[120px] rounded-[80px] bg-[linear-gradient(180deg,#bf3148,#16080b)] opacity-90 blur-[1px]" />
                <div className="absolute right-[14%] top-[8%] h-[235px] w-[120px] rounded-[80px] bg-[linear-gradient(180deg,#a31222,#16080b)] opacity-90 blur-[1px]" />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.32))]" />
              </div>
            </div>

            <div className="flex flex-col justify-center pt-8 lg:pt-16">
              <div className="text-right text-[64px] font-black uppercase leading-[0.86] tracking-[-0.06em] text-[#f7e3bf] sm:text-[90px] lg:text-[110px]">
                <div>DEVE</div>
                <div>LOPER</div>
              </div>

              <div className="mt-6 text-right text-xs uppercase tracking-[0.28em] text-[#f6e7df]/65">
                premium feminine frontend branding
              </div>

              <div className="mt-8 space-y-3 text-right">
                <div className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                  MARINA
                </div>
                <div className="text-sm uppercase tracking-[0.28em] text-[#f5c8ad]">
                  Frontend Developer
                </div>
                <p className="ml-auto max-w-sm text-sm leading-7 text-[#f6e7df]/78">
                  Создаю современные, быстрые и визуально сильные веб-интерфейсы
                  с акцентом на UX, чистый код и сильный личный бренд.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <a href="#projects" className="glav-title font-semibold rounded-full bg-[#f4e6d6] px-5 py-2.5 text-sm font-medium text-[#4d0910] transition hover:bg-white ">
                  View Projects
                </a>
                <a href="#contact" className="glav-title font-semibold rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  Contact Me
                </a>
                <a href="#" className="glav-title font-semibold rounded-full border border-[#d36a2e]/40 bg-[#d36a2e]/8 px-5 py-2.5 text-sm font-medium text-[#f5c8ad] transition hover:bg-[#d36a2e]/14">
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div id="about" className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(91,9,16,0.9),rgba(58,6,10,0.95))] p-5">
            <div className="grid gap-4 md:grid-cols-[0.32fr_0.68fr]">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 text-3xl font-black tracking-[-0.05em]">Кто я?</div>
                <div className="relative mx-auto mt-6 h-48 w-40 rounded-[24px] bg-[linear-gradient(180deg,#241014,#0a090a)]">
                  <div className="absolute left-1/2 top-5 h-14 w-14 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#bd3447,#271014)]" />
                  <div className="absolute left-1/2 top-16 h-6 w-16 -translate-x-1/2 rounded-full border border-[#f0e4da]/40" />
                  <div className="absolute left-1/2 top-20 h-20 w-20 -translate-x-1/2 rounded-t-[40px] rounded-b-[14px] bg-[#1a1215]" />
                  <div className="absolute left-1/2 top-[112px] h-20 w-10 -translate-x-1/2 rounded-b-full bg-[#120c0f]" />
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                <div className="glav-title font-bold text-3xl    tracking-[0.2em] glav-title">About Me</div>
                <p className="mt-4 text-sm leading-7 text-[#f6e7df]/80">
                  Я Frontend Developer. Люблю сильный UI, аккуратный код и
                  современные digital-продукты. Создаю адаптивные интерфейсы,
                  которые выглядят премиально, работают быстро и оставляют
                  ощущение уверенного бренда.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-[#f6e7df]/78">
                  <li>• создаю современные и быстрые интерфейсы</li>
                  <li>• делаю адаптивную верстку</li>
                  <li>• работаю с React / TypeScript / Next.js</li>
                  <li>• уделяю внимание UX, анимациям и производительности</li>
                </ul>
              </div>
            </div>
          </div>

          <div id="process" className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(81,8,14,0.92),rgba(49,5,9,0.96))] p-5">
            <div className="mb-4 text-[29px] font-semibold  tracking-[0.3em] glav-title ">Этапы работы</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {process.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <div className="tracking-[0.1em] glav-title mb-2 inline-flex rounded-full border border-[#d36a2e]/25 bg-[#d36a2e]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#f5c8ad] ">
                    step {item.id}
                  </div>
                  <div className="text-lg font-semibold tracking-[0.06em] glav-title text-start">{item.title}</div>
                  <p className="mt-2 text-[15px] text-start leading-6 glav-title text-[#f6e7df]/72">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="mt-5 grid gap-5 lg:grid-cols-2">
          {projects.map((project, index) => (
            <article
              key={project.title}
              className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(96,10,18,0.92),rgba(42,5,8,0.98))] p-4"
            >
              <div className="mb-4 text-3xl font-black tracking-[-0.05em]">
                {index === 0 ? "Референсинг сайта" : project.title}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-[#18090c] p-3">
                  <div className="rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,#2c0f14,#0f090b)] p-3">
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

                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-semibold glav-title tracking-[0.1em]">{project.title}</div>
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
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(90,9,16,0.92),rgba(44,6,10,0.98))] p-5">
            <div className="mb-4 text-3xl font-black tracking-[-0.05em]">Другие работы</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherWorks.map((item, i) => (
                <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                  <div className="mb-3 h-24 rounded-[18px] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(211,106,46,0.12))]" />
                  <div className="text-sm font-medium">{item}</div>
                  <div className="mt-1 text-xs text-[#f6e7df]/55">project #{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="skills" className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(72,8,13,0.94),rgba(35,5,8,0.98))] p-5">
            <div className="mb-4 text-3xl font-black tracking-[-0.05em]">Skills</div>
            <div className="grid grid-cols-2 gap-3">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-sm text-[#f6e7df]/86"
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
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.52fr_0.48fr]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(84,9,15,0.94),rgba(37,5,8,0.98))] p-5">
            <div className="mb-4 text-3xl font-black tracking-[-0.05em]">Why Hire Me</div>
            <p className="max-w-2xl text-sm leading-7 text-[#f6e7df]/80">
              Это портфолио не просто про красивую подачу. Оно показывает, что я
              умею собирать современные интерфейсы, чувствую визуальный стиль и
              могу превращать идею в сильный frontend-продукт.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {strengths.map((item) => (
                <div key={item} className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div id="contact" className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(122,14,24,0.86),rgba(69,8,13,0.94),rgba(40,6,9,0.98))] p-5">
            <div className="text-[44px] font-black leading-none tracking-[-0.05em] sm:text-[58px]">
              Сотрудничество
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[0.54fr_0.46fr]">
              <div>
                <div className="rounded-[20px] border border-white/10 bg-white/8 p-4 text-sm leading-7 text-[#f6e7df]/82">
                  Ищу интересные проекты, сильную команду и возможность создавать
                  современные digital-продукты с выразительным визуалом и качественной frontend-реализацией.
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {["Telegram", "GitHub", "LinkedIn", "Email"].map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="flex min-h-[96px] items-center justify-center rounded-[20px] border border-white/10 bg-white/6 text-sm font-medium transition hover:bg-white/10"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="relative h-56 w-56 rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,220,205,0.18),rgba(117,13,24,0.1),rgba(41,5,8,0.92))]">
                  <div className="absolute left-1/2 top-[17%] h-16 w-16 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#bd3447,#271014)]" />
                  <div className="absolute left-1/2 top-[27%] h-7 w-18 -translate-x-1/2 rounded-full border border-[#f0e4da]/45" />
                  <div className="absolute left-1/2 top-[34%] h-24 w-28 -translate-x-1/2 rounded-t-[50px] rounded-b-[20px] bg-[#181012]" />
                  <div className="absolute left-[23%] top-[8%] h-28 w-16 rounded-[40px] bg-[linear-gradient(180deg,#bf3148,#16080b)] opacity-90" />
                  <div className="absolute right-[23%] top-[8%] h-32 w-16 rounded-[40px] bg-[linear-gradient(180deg,#a31222,#16080b)] opacity-90" />
                </div>
                <div className="mt-3 text-sm uppercase tracking-[0.28em] text-[#f6e7df]/72">MARINA</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-4 max-w-7xl border-t border-white/10 px-4 py-6 text-sm text-[#f6e7df]/55 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-semibold text-white">MARINA</span> — Frontend Developer
          </div>
          <div>Premium feminine developer portfolio</div>
          <div>© 2026 All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

