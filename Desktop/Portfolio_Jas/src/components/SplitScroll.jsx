import { useLayoutEffect, useRef } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function SplitScroll({
    children,
    className,
    textClassName,
    mode = "lines",
    start = "top 80%",
    once = true,
    duration = 0.9,
    stagger = 0.12,
    fromYPercent = 120,
    fromX = 0,
    fromOpacity = 0,
}) {
    const rootRef = useRef(null);
    const textRef = useRef(null);

    useLayoutEffect(() => {
        if (!rootRef.current || !textRef.current) return;

        const ctx = gsap.context(() => {
            // li-list mode — animate each list item
            const listItems = textRef.current.querySelectorAll("li");
            if (listItems.length > 0) {
                const targets = Array.from(listItems);
                gsap.set(targets, { yPercent: fromYPercent, x: fromX, opacity: fromOpacity });
                const tl = gsap.to(targets, {
                    yPercent: 0, x: 0, opacity: 1,
                    duration, ease: "power4.out", stagger,
                    scrollTrigger: { trigger: rootRef.current, start, once },
                });
                return () => { tl.scrollTrigger?.kill(); tl.kill(); };
            }

            // SplitText mode
            const split = new SplitText(textRef.current, { type: mode });

            if (mode === "lines") {
                split.lines.forEach((line) => {
                    const wrapper = document.createElement("div");
                    wrapper.style.overflow = "hidden";
                    wrapper.style.display = "block";
                    line.parentNode?.insertBefore(wrapper, line);
                    wrapper.appendChild(line);
                });
            }

            const targets =
                mode === "chars" ? split.chars
                : mode === "words" ? split.words
                : split.lines;

            gsap.set(targets, {
                yPercent: mode === "lines" ? fromYPercent : 0,
                x: fromX,
                opacity: mode !== "lines" ? fromOpacity : 1,
            });

            const tl = gsap.to(targets, {
                yPercent: 0, x: 0, opacity: 1,
                duration, ease: "power4.out", stagger,
                scrollTrigger: { trigger: rootRef.current, start, once },
            });

            return () => { tl.scrollTrigger?.kill(); tl.kill(); split.revert(); };
        }, rootRef);

        return () => ctx.revert();
    }, [mode, start, once, duration, stagger, fromYPercent, fromX, fromOpacity]);

    return (
        <div ref={rootRef} className={className}>
            <div ref={textRef} className={cn("will-change-transform", textClassName)}>
                {children}
            </div>
        </div>
    );
}

SplitScroll.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    textClassName: PropTypes.string,
    mode: PropTypes.oneOf(["lines", "words", "chars"]),
    start: PropTypes.string,
    once: PropTypes.bool,
    duration: PropTypes.number,
    stagger: PropTypes.number,
    fromYPercent: PropTypes.number,
    fromX: PropTypes.number,
    fromOpacity: PropTypes.number,
};