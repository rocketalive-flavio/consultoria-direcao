// src/lib/gsap.js — Motion system (single source of GSAP). Pin exact versions.
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger.js';
import { SplitText } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/SplitText.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

gsap.defaults({ ease: 'power3.out', duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
