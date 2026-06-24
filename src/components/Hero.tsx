"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`;

const FS = `
precision highp float;
uniform vec2  u_res;
uniform float u_t;

float hash(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+74.41);return fract(p.x*p.y);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 R=mat2(0.8,0.6,-0.6,0.8);
  for(int i=0;i<4;i++){v+=a*noise(p);p=R*p*2.05;a*=0.50;}
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float t  = u_t;

  float loopX = 0.22 * sin(t * 0.55);
  float loopY = 0.16 * cos(t * 0.42);
  vec2 pan = uv + vec2(loopX, loopY);

  float wx = fbm(pan*0.80 + vec2(t*0.09, t*0.06));
  float wy = fbm(pan*0.80 + vec2(t*0.07+3.8, t*0.10+2.0));
  vec2 w = pan + 0.038 * vec2(wx-0.5, wy-0.5);

  float base = smoothstep(-0.15, 1.15, w.x * 0.6 + w.y * 0.4);
  float topDark = (1.0 - smoothstep(0.10, 0.75, w.y)) * 0.50;

  vec2 navyC = vec2(
    0.25 + 0.18*sin(t*0.50),
    0.48 + 0.15*cos(t*0.38+1.0)
  );
  float navyD = length(w - navyC);
  float navy  = smoothstep(0.50, 0.0, navyD) * 0.68;

  vec2 brightC = vec2(
    0.72 + 0.18*sin(t*0.44+3.14),
    0.55 + 0.14*cos(t*0.36+2.0)
  );
  float brightD = length(w - brightC);
  float bright  = exp(-brightD*brightD / 0.18) * 0.30;

  vec2 bright2C = vec2(
    0.85 + 0.10*cos(t*0.33+1.5),
    0.80 + 0.10*sin(t*0.41+0.7)
  );
  float bright2D = length(w - bright2C);
  float bright2  = exp(-bright2D*bright2D / 0.12) * 0.20;

  float field = base - topDark - navy + bright + bright2;
  field += 0.025 * sin(t*0.60);
  field = clamp(field, 0.0, 1.0);

  vec3 c0 = vec3(0.047, 0.267, 0.761);
  vec3 c1 = vec3(0.059, 0.231, 0.784);
  vec3 c2 = vec3(0.106, 0.322, 0.918);
  vec3 c3 = vec3(0.243, 0.396, 0.996);

  vec3 col;
  float s = field * 3.0;
  if(s < 1.0)      col = mix(c0, c1, smoothstep(0.0,1.0,s));
  else if(s < 2.0) col = mix(c1, c2, smoothstep(0.0,1.0,s-1.0));
  else             col = mix(c2, c3, smoothstep(0.0,1.0,s-2.0));

  vec2 vig = uv*2.0-1.0;
  col *= 1.0 - dot(vig,vig)*0.07;

  gl_FragColor = vec4(clamp(col,0.0,1.0),1.0);
}
`;

export default function Hero() {
  const meshRef = useRef<HTMLCanvasElement>(null);
  const partRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    const part = partRef.current;
    if (!mesh || !part) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = (mesh.getContext("webgl") ||
      mesh.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const ctx = part.getContext("2d");
    if (!gl || !ctx) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");

    const GRID = 32;
    const ATTRACT = 110;
    const SPRING = 0.09;
    const DAMP = 0.75;
    const PULL = 0.048;

    let W = 0;
    let H = 0;
    let pts: { ox: number; oy: number; x: number; y: number; vx: number; vy: number }[] = [];
    const mouse = { x: -9999, y: -9999, on: false };

    const buildPts = () => {
      pts = [];
      const cols = Math.ceil(W / GRID) + 2;
      const rows = Math.ceil(H / GRID) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pts.push({ ox: c * GRID, oy: r * GRID, x: c * GRID, y: r * GRID, vx: 0, vy: 0 });
        }
      }
    };
    const resize = () => {
      W = mesh.width = part.width = window.innerWidth;
      H = mesh.height = part.height = window.innerHeight;
      gl.viewport(0, 0, W, H);
      gl.uniform2f(uRes, W, H);
      buildPts();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        let fx = (p.ox - p.x) * SPRING;
        let fy = (p.oy - p.y) * SPRING;
        if (mouse.on) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ATTRACT) {
            const f = (1 - d / ATTRACT) ** 2;
            fx += dx * f * PULL;
            fy += dy * f * PULL;
          }
        }
        p.vx = (p.vx + fx) * DAMP;
        p.vy = (p.vy + fy) * DAMP;
        p.x += p.vx;
        p.y += p.vy;
        const ddx = p.x - p.ox;
        const ddy = p.y - p.oy;
        const disp = Math.min(Math.sqrt(ddx * ddx + ddy * ddy) / 20, 1);
        const radius = 1.0 + disp * 2.6;
        const alpha = 0.48 + disp * 0.52;
        if (disp > 0.07) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 8);
          g.addColorStop(0, `rgba(170,190,255,${(disp * 0.45).toFixed(2)})`);
          g.addColorStop(1, "rgba(170,190,255,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 8, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,230,255,${alpha.toFixed(2)})`;
        ctx.fill();
      }
    };

    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      const t = reduceMotion ? 0 : (performance.now() - t0) * 0.001;
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduceMotion) drawParticles();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const onLeave = () => {
      mouse.on = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    resize();
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      id="hero"
      className="hero-section relative w-full overflow-hidden flex flex-col"
    >
      <canvas ref={meshRef} className="absolute inset-0 z-[1]" aria-hidden="true" />
      <canvas
        ref={partRef}
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
      />

      <div
        className="hero-inner relative z-10 flex h-full flex-col"
      >
        {/* Hero content */}
        <div
          className="hero-content flex flex-1 flex-col"
          style={{
            gap: "clamp(14px,1.5vw,26px)",
          }}
        >
          <div className="flex flex-col" style={{ gap: "clamp(8px,1.1vw,19px)" }}>
            <div
              className="font-display"
              style={{
                fontSize: "clamp(26px,6.02vw,104px)",
                lineHeight: 1.06,
                background: "linear-gradient(-12.74deg, #ffffff 63.24%, #99adff 92.25%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <div>Hi, my name is Rakshit</div>
              <div>and I love building Products</div>
            </div>
          </div>
          <div
            className="flex flex-wrap items-center"
            style={{ gap: "clamp(10px,1.39vw,24px)" }}
          >
            <Link
              href="/chat"
              className="font-figtree inline-flex items-center justify-center bg-white text-[#194ddd] font-medium no-underline transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,.18)] whitespace-nowrap"
              style={{
                borderRadius: "clamp(10px,1.11vw,19px)",
                padding: "0 clamp(18px,3.47vw,60px)",
                height: "clamp(44px,5.09vw,88px)",
                gap: "clamp(8px,.93vw,16px)",
                fontSize: "clamp(13px,1.16vw,20px)",
              }}
            >
              Chat with my AI
              <span style={{ fontSize: "1em" }}>✦</span>
            </Link>
            <a
              href="#my-story"
              className="font-figtree inline-flex items-center justify-center border-white bg-transparent text-white font-medium no-underline transition-all hover:bg-white/10 hover:-translate-y-0.5 whitespace-nowrap"
              style={{
                borderRadius: "clamp(10px,1.11vw,19px)",
                padding: "0 clamp(18px,3.59vw,62px)",
                height: "clamp(44px,5.09vw,88px)",
                borderWidth: "clamp(1.5px,.12vw,2px)",
                borderStyle: "solid",
                fontSize: "clamp(13px,1.16vw,20px)",
              }}
            >
              My Story
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          height: 100vh;
        }
        .hero-inner {
          padding: clamp(20px, 2.6vw, 48px) clamp(16px, 5.3vw, 92px)
            clamp(36px, 4.4vw, 76px);
        }
        .hero-content {
          justify-content: flex-end;
          padding-bottom: clamp(24px, 8vh, 120px);
          padding-top: 0;
        }
        @media (max-width: 768px) {
          .hero-section {
            height: auto;
            min-height: 0;
          }
          .hero-inner {
            padding: 92px 20px 48px;
          }
          .hero-content {
            justify-content: flex-start;
            padding-bottom: 24px;
            padding-top: 0;
          }
        }
      `}</style>
    </section>
  );
}
