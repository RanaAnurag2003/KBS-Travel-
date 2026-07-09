import { useLayoutEffect, useRef, useState } from "react";
import { gsap, MotionPathPlugin } from "gsap/all";
import "./TravelLoader.css";

gsap.registerPlugin(MotionPathPlugin);

// Module-scope flag: resets on a real page refresh (the module re-evaluates),
// but survives across re-renders / client-side route changes so the loader
// never replays while the user is simply navigating the SPA.
let hasPlayedThisSession = false;

// Flight path: a gentle "takeoff" curve, low and flat at first, sweeping up
// and off the top-right. Coordinates live in a 1200x700 viewBox and are
// scaled by the SVG's preserveAspectRatio, not by media queries.
const PATH_DESKTOP = "M -80 640 C 220 610, 480 300, 760 120 S 1140 -60, 1320 -140";
const PATH_MOBILE = "M -60 560 C 140 540, 320 320, 500 190 S 760 20, 900 -80";

// Roughly where the flight path crosses the middle of the frame — used to
// place the foreground cloud the aircraft ducks behind.
const CROSSING = { desktop: { left: "47%", top: "40%" }, mobile: { left: "48%", top: "42%" } };

export default function TravelLoader({ onDone }) {
    const [mounted, setMounted] = useState(!hasPlayedThisSession);
    const containerRef = useRef(null);
    const planeRef = useRef(null);
    const bankRef = useRef(null);
    const blurFilterRef = useRef(null);
    const trailCoreRef = useRef(null);
    const trailMidRef = useRef(null);
    const trailOuterRef = useRef(null);
    const logoRef = useRef(null);
    const taglineRef = useRef(null);
    const particlesRef = useRef([]);
    const bgCloudsRef = useRef([]);
    const fgCloudRef = useRef(null);
    const pathRef = useRef(null);

    useLayoutEffect(() => {
        if (!mounted) {
            onDone?.();
            return;
        }

        hasPlayedThisSession = true;

        const container = containerRef.current;
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const finish = () => {
            setMounted(false);
            onDone?.();
        };

        // --- Reduced motion: skip the journey, just dissolve into the homepage ---
        if (prefersReducedMotion) {
            const tl = gsap.timeline({ onComplete: finish });
            tl.set(container, { autoAlpha: 1 });
            tl.to(container, { autoAlpha: 0, duration: 0.4, delay: 0.2, ease: "power1.out" });
            return () => tl.kill();
        }

        const isMobile = window.innerWidth < 640;
        const pathData = isMobile ? PATH_MOBILE : PATH_DESKTOP;
        const path = pathRef.current;
        const trails = [trailCoreRef.current, trailMidRef.current, trailOuterRef.current];
        path.setAttribute("d", pathData);
        trails.forEach((t) => t.setAttribute("d", pathData));

        const totalLength = path.getTotalLength();
        gsap.set(trails, {
            strokeDasharray: totalLength,
            strokeDashoffset: totalLength,
        });

        const plane = planeRef.current;
        const bank = bankRef.current;
        const particles = particlesRef.current.filter(Boolean);
        const bgClouds = bgCloudsRef.current.filter(Boolean);
        const fgCloud = fgCloudRef.current;

        gsap.set(container, { autoAlpha: 1 });
        gsap.set(plane, { autoAlpha: 0, scale: 0.5 });
        gsap.set(bank, { rotateZ: 0 });
        gsap.set(logoRef.current, { autoAlpha: 0, scale: 0.9 });
        gsap.set(taglineRef.current, { autoAlpha: 0, y: 6 });
        gsap.set(particles, { autoAlpha: 0, scale: 0.4 });
        gsap.set(bgClouds, { autoAlpha: 0 });
        gsap.set(fgCloud, { autoAlpha: 0, scale: 0.92 });

        const blurState = { v: 0 };
        const syncBlur = () =>
            blurFilterRef.current?.setAttribute("stdDeviation", blurState.v.toFixed(2));

        const FLIGHT_START = 0.15;
        const FLIGHT_DURATION = 1.05; // ends at 1.2s, matching the timing spec

        const tl = gsap.timeline({ onComplete: finish });

        // 0.0s — dark stage is already visible (container faded in on mount)

        // 0.15s — the aircraft appears small in the distance and begins its climb.
        tl.to(plane, { autoAlpha: 1, duration: 0.15 }, FLIGHT_START);

        // Heading + position: one continuous tween along the flight path.
        tl.to(
            plane,
            {
                motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true },
                duration: FLIGHT_DURATION,
                ease: "power1.inOut",
            },
            FLIGHT_START
        );

        // Depth: small (far) -> large (overhead, closest to camera) -> small (far again).
        tl.to(
            plane,
            {
                keyframes: [
                    { scale: 0.5, duration: 0 },
                    { scale: 1.18, duration: 0.55, ease: "sine.out" },
                    { scale: 0.48, duration: 0.5, ease: "sine.in" },
                ],
            },
            FLIGHT_START
        );

        // Banking: subtle roll independent of heading, layered on the inner group.
        tl.to(
            bank,
            {
                keyframes: [
                    { rotateZ: 0, duration: 0 },
                    { rotateZ: -10, duration: 0.28, ease: "sine.inOut" },
                    { rotateZ: 7, duration: 0.34, ease: "sine.inOut" },
                    { rotateZ: -4, duration: 0.28, ease: "sine.inOut" },
                    { rotateZ: 0, duration: 0.15, ease: "sine.out" },
                ],
            },
            FLIGHT_START
        );

        // Motion blur: ramps up once airborne and moving fast, gone before it exits.
        tl.to(
            blurState,
            {
                keyframes: [
                    { v: 0, duration: 0 },
                    { v: 3, duration: 0.3, ease: "power1.in" },
                    { v: 2.2, duration: 0.45, ease: "sine.inOut" },
                    { v: 0, duration: 0.3, ease: "power1.out" },
                ],
                onUpdate: syncBlur,
            },
            FLIGHT_START
        );

        // Final fade as it shrinks into the sky.
        tl.to(plane, { autoAlpha: 0, duration: 0.15, ease: "power1.in" }, 1.15);

        // Background cloud layers drift in slowly — far behind, low contrast.
        bgClouds.forEach((cloud, i) => {
            tl.to(
                cloud,
                { autoAlpha: 0.5, x: `+=${30 + i * 18}`, duration: 1.5, ease: "sine.out" },
                0.15 + i * 0.12
            );
        });

        // Foreground cloud: the aircraft briefly ducks behind it mid-flight.
        tl.to(fgCloud, { autoAlpha: 0.85, scale: 1, duration: 0.3, ease: "power1.out" }, 0.42)
            .to(fgCloud, { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, 0.82);

        // 0.4s — the contrail begins drawing itself along the flight path
        tl.to(trails, { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut" }, 0.4);

        // glowing particles waking up along the journey
        particles.forEach((p, i) => {
            tl.to(
                p,
                { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power1.out" },
                0.5 + i * 0.08
            ).to(
                p,
                { autoAlpha: 0, duration: 0.3, ease: "power1.in" },
                1.15 + i * 0.05
            );
        });

        // 0.7s — wordmark rises into view as the plane crosses center
        tl.to(
            logoRef.current,
            { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" },
            0.7
        );
        tl.to(
            taglineRef.current,
            { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
            0.78
        );

        // 1.2s — plane exits top-right (motion path tween above already ends here)

        // 1.5s — wordmark dissolves
        tl.to(
            [logoRef.current, taglineRef.current],
            { autoAlpha: 0, duration: 0.2, ease: "power1.in" },
            1.5
        );
        tl.to(bgClouds, { autoAlpha: 0, duration: 0.2 }, 1.5);
        // the vapor trail lingers a beat, then gently disperses
        tl.to(trails, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 1.42);

        // 1.6s — the whole loader dissolves into the homepage beneath it
        tl.to(
            container,
            { autoAlpha: 0, duration: 0.3, ease: "power1.inOut" },
            1.6
        );

        return () => tl.kill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted]);

    if (!mounted) return null;

    const crossing = window.innerWidth < 640 ? CROSSING.mobile : CROSSING.desktop;

    return (
        <div className="travel-loader" ref={containerRef} aria-hidden="true">
            {/* far background cloud layer — behind everything, heavy blur, slow drift */}
            <div className="travel-loader__clouds">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={`travel-loader__cloud travel-loader__cloud--${["a", "b", "c"][i]}`}
                        ref={(el) => (bgCloudsRef.current[i] = el)}
                    >
                        <span className="travel-loader__cloud-puff" />
                        <span className="travel-loader__cloud-puff travel-loader__cloud-puff--2" />
                        <span className="travel-loader__cloud-puff travel-loader__cloud-puff--3" />
                    </span>
                ))}
            </div>

            <svg
                className="travel-loader__svg"
                viewBox="0 0 1200 700"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="fuselageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="42%" stopColor="#eef2f6" />
                        <stop offset="65%" stopColor="#d7dee6" />
                        <stop offset="100%" stopColor="#b9c4d0" />
                    </linearGradient>
                    <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f6f8fa" />
                        <stop offset="100%" stopColor="#c3ccd6" />
                    </linearGradient>
                    <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#16294a" />
                        <stop offset="55%" stopColor="#0e1d38" />
                        <stop offset="100%" stopColor="#070f22" />
                    </linearGradient>
                    <linearGradient id="engineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e4e9ee" />
                        <stop offset="55%" stopColor="#8f99a5" />
                        <stop offset="100%" stopColor="#4d5763" />
                    </linearGradient>
                    <radialGradient id="noseGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#eaf9ff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="trailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="45%" stopColor="#bdeefc" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="motionBlur" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur ref={blurFilterRef} stdDeviation="0" />
                    </filter>
                    <filter id="vaporSoft" x="-120%" y="-120%" width="340%" height="340%">
                        <feGaussianBlur stdDeviation="6" />
                    </filter>
                    <filter id="vaporMid" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="2.5" />
                    </filter>
                </defs>

                {/* invisible reference path driving the MotionPathPlugin tweens */}
                <path ref={pathRef} d={PATH_DESKTOP} className="travel-loader__ghost-path" />

                {/* layered vapor contrail: soft outer glow -> mid body -> bright core */}
                <path
                    ref={trailOuterRef}
                    d={PATH_DESKTOP}
                    className="travel-loader__trail travel-loader__trail--outer"
                    filter="url(#vaporSoft)"
                />
                <path
                    ref={trailMidRef}
                    d={PATH_DESKTOP}
                    className="travel-loader__trail travel-loader__trail--mid"
                    filter="url(#vaporMid)"
                />
                <path
                    ref={trailCoreRef}
                    d={PATH_DESKTOP}
                    className="travel-loader__trail travel-loader__trail--core"
                    stroke="url(#trailGradient)"
                />

                {/* ambient particles scattered near the route */}
                {[
                    [300, 520],
                    [520, 380],
                    [700, 260],
                    [880, 140],
                    [1010, 60],
                ].map(([cx, cy], i) => (
                    <circle
                        key={i}
                        ref={(el) => (particlesRef.current[i] = el)}
                        cx={cx}
                        cy={cy}
                        r={i % 2 === 0 ? 3.2 : 2.2}
                        className="travel-loader__particle"
                    />
                ))}

                {/* the aircraft: heading + depth on the outer group, banking on the inner one */}
                <g ref={planeRef} filter="url(#motionBlur)">
                    <g ref={bankRef} className="travel-loader__plane">
                        <AircraftArt />
                    </g>
                </g>
            </svg>

            {/* foreground cloud the aircraft briefly disappears behind */}
            <div
                className="travel-loader__cloud-foreground"
                ref={fgCloudRef}
                style={{ left: crossing.left, top: crossing.top }}
            >
                <span className="travel-loader__cloud-puff" />
                <span className="travel-loader__cloud-puff travel-loader__cloud-puff--2" />
                <span className="travel-loader__cloud-puff travel-loader__cloud-puff--3" />
            </div>

            <div className="travel-loader__wordmark">
                <h1 ref={logoRef} className="travel-loader__logo">
                    KBS Travels
                </h1>
                <p ref={taglineRef} className="travel-loader__tagline">
                    Explore Beyond Boundaries
                </p>
            </div>
        </div>
    );
}

// A stylised commercial widebody (Boeing 787 / Airbus A350-class proportions),
// drawn nose-right so it aligns with MotionPathPlugin's autoRotate heading.
// Rendered from a shallow three-quarter-aerial angle: the lower wing/engine
// reads as "nearer" (larger) and the upper one as "farther" (smaller), which
// is what gives it a sense of depth even before any animation is applied.
function AircraftArt() {
    return (
        <g transform="scale(1.05)">
            {/* soft ambient occlusion under the wing roots */}
            <ellipse cx="-10" cy="26" rx="46" ry="14" fill="#03070f" opacity="0.22" filter="url(#vaporMid)" />

            {/* far wing (upper/back — smaller, simulates distance) */}
            <path
                d="M8 -8 L-72 -54 Q-80 -58 -74 -50 L-26 -13 Z"
                fill="url(#wingGradient)"
                stroke="#aab4bf"
                strokeWidth="0.6"
            />
            {/* far engine */}
            <ellipse cx="-16" cy="-32" rx="10" ry="4.4" fill="url(#engineGradient)" transform="rotate(-28 -16 -32)" />
            <ellipse cx="-19" cy="-34" rx="3" ry="1.4" fill="#eef3f7" opacity="0.7" transform="rotate(-28 -19 -34)" />

            {/* horizontal stabilizers (tail wings) */}
            <path d="M-84 -4 L-106 -18 Q-110 -20 -105 -16 L-88 -6 Z" fill="url(#wingGradient)" />
            <path d="M-84 5 L-109 20 Q-113 23 -107 19 L-88 7 Z" fill="url(#wingGradient)" />

            {/* vertical tail fin, swept back, navy to match the brand */}
            <path
                d="M-68 -6 L-99 -47 Q-102 -51 -99 -44 L-79 -8 Z"
                fill="url(#tailGradient)"
            />
            <path d="M-95 -42 L-99 -47 L-90 -35 Z" fill="#67e8f9" opacity="0.85" />

            {/* fuselage */}
            <path
                d="M-95 -6
           C -60 -9.5, 20 -9.5, 55 -7.2
           C 76 -6.3, 90 -3.6, 101 0
           C 90 3.6, 76 6.3, 55 7.2
           C 20 9.5, -60 9.5, -95 6
           C -99 3, -99 -3, -95 -6 Z"
                fill="url(#fuselageGradient)"
                stroke="#c7d0d9"
                strokeWidth="0.5"
            />

            {/* top sheen highlight */}
            <path
                d="M-70 -6.6 C -30 -8.6, 15 -8.4, 48 -6.4"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.65"
                fill="none"
            />

            {/* cabin windows */}
            <g fill="#334155" opacity="0.55">
                {Array.from({ length: 15 }).map((_, i) => (
                    <circle key={i} cx={-58 + i * 7.4} cy={-2.6} r="0.85" />
                ))}
            </g>

            {/* cockpit glass */}
            <path d="M78 -4.6 Q90 -3, 95.5 0 Q90 3, 78 4.6 Q74 0, 78 -4.6 Z" fill="#182636" opacity="0.85" />

            {/* near wing (lower/front — larger, closer to camera) */}
            <path
                d="M12 8 L-78 66 Q-88 72 -80 62 L-22 15 Z"
                fill="url(#wingGradient)"
                stroke="#aab4bf"
                strokeWidth="0.6"
            />
            {/* near engine */}
            <ellipse cx="-22" cy="40" rx="14.5" ry="6.2" fill="url(#engineGradient)" transform="rotate(32 -22 40)" />
            <ellipse cx="-27" cy="43" rx="4.2" ry="2" fill="#f3f7fa" opacity="0.75" transform="rotate(32 -27 43)" />

            {/* nose glow */}
            <circle cx="99" cy="0" r="14" fill="url(#noseGlow)" />
        </g>
    );
}