import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 10;
const TOP_OFFSET = 50;

/**
 * Desktop smart navbar:
 * - Top of page: visible, full width, transparent
 * - Scroll down: fade up (hide)
 * - Scroll up: fade down (show)
 */
export function useNavbarScroll() {
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        lastScrollY.current = window.scrollY;

        const update = () => {
            const currentY = window.scrollY;
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            const delta = currentY - lastScrollY.current;

            setIsAtTop(currentY < TOP_OFFSET);

            if (!isDesktop) {
                setIsVisible(true);
                lastScrollY.current = currentY;
                ticking.current = false;
                return;
            }

            if (currentY < TOP_OFFSET) {
                setIsVisible(true);
            } else if (delta > SCROLL_THRESHOLD) {
                setIsVisible(false);
            } else if (delta < -SCROLL_THRESHOLD) {
                setIsVisible(true);
            }

            lastScrollY.current = currentY;
            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                ticking.current = true;
                requestAnimationFrame(update);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return { isVisible, isAtTop };
}
