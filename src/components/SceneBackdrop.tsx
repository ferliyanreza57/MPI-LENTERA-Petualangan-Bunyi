import React, { useEffect, useRef } from 'react';
import { DEFAULT_STAGE1_BG, DEFAULT_STAGE2_BG, DEFAULT_STAGE3_BG, DEFAULT_STAGE4_BG, DEFAULT_STAGE5_BG, SLIDE_META } from '../data/slidesData';

interface SceneBackdropProps {
  slideNum: number;
  customVisuals?: Record<string, string>;
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const SceneBackdrop: React.FC<SceneBackdropProps> = ({ slideNum, customVisuals }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isStage1 = slideNum >= 3 && slideNum <= 5;
  const isStage2 = slideNum >= 6 && slideNum <= 9;
  const isStage3 = slideNum >= 10 && slideNum <= 13;
  const isStage4 = slideNum >= 14 && slideNum <= 17;
  const isStage5 = slideNum >= 18 && slideNum <= 21;

  useEffect(() => {
    if (isStage1 || isStage2 || isStage3 || isStage4 || isStage5) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (slideNum === 2) {
      // Tropical 5-Island Adventure Map
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.38);
      skyGrad.addColorStop(0, '#0284C7');
      skyGrad.addColorStop(0.6, '#38BDF8');
      skyGrad.addColorStop(1, '#BAE6FD');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.38);

      const drawCloud = (cx: number, cy: number, s: number) => {
        const cg = ctx.createRadialGradient(cx, cy - 10 * s, 5, cx, cy, 75 * s);
        cg.addColorStop(0, 'rgba(255,255,255,0.96)');
        cg.addColorStop(0.7, 'rgba(224,242,254,0.82)');
        cg.addColorStop(1, 'rgba(186,230,253,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, 62 * s, 0, Math.PI * 2);
        ctx.arc(cx + 46 * s, cy + 8 * s, 48 * s, 0, Math.PI * 2);
        ctx.arc(cx - 46 * s, cy + 10 * s, 45 * s, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(160, 88, 1.1);
      drawCloud(610, 62, 0.95);
      drawCloud(1090, 92, 1.15);

      // Distant volcanic hills
      const mtnGrad = ctx.createLinearGradient(900, 35, 900, 235);
      mtnGrad.addColorStop(0, '#475569');
      mtnGrad.addColorStop(0.45, '#15803D');
      mtnGrad.addColorStop(1, '#0284C7');
      ctx.fillStyle = mtnGrad;
      ctx.beginPath();
      ctx.moveTo(760, 225);
      ctx.lineTo(880, 85);
      ctx.lineTo(955, 145);
      ctx.lineTo(1045, 36);
      ctx.lineTo(1145, 130);
      ctx.lineTo(1210, 78);
      ctx.lineTo(1280, 225);
      ctx.closePath();
      ctx.fill();

      // Layered tropical ocean
      const seaGrad = ctx.createLinearGradient(0, H * 0.25, 0, H);
      seaGrad.addColorStop(0, '#0369A1');
      seaGrad.addColorStop(0.28, '#0284C7');
      seaGrad.addColorStop(0.62, '#06B6D4');
      seaGrad.addColorStop(1, '#0E7490');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, H * 0.25, W, H * 0.75);

      ctx.fillStyle = 'rgba(165, 243, 252, 0.26)';
      for (let i = 0; i < 36; i++) {
        const rx = (i * 173) % W;
        const ry = H * 0.3 + ((i * 97) % (H * 0.65));
        ctx.beginPath();
        ctx.ellipse(rx, ry, 28 + (i % 18), 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wooden suspension bridges
      const drawBridge = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.save();
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 11;
        ctx.setLineDash([12, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 24, x2, y2);
        ctx.stroke();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x1, y1 - 8);
        ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 14, x2, y2 - 8);
        ctx.stroke();
        ctx.restore();
      };
      drawBridge(355, 345, 520, 275);
      drawBridge(760, 275, 925, 345);
      drawBridge(540, 565, 745, 565);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(270, 390);
      ctx.quadraticCurveTo(340, 495, 425, 555);
      ctx.moveTo(1010, 390);
      ctx.quadraticCurveTo(960, 495, 865, 555);
      ctx.stroke();
      ctx.restore();

      const drawIsland = (cx: number, cy: number, rx: number, ry: number, type: number) => {
        const reefGrad = ctx.createRadialGradient(cx, cy + 12, rx * 0.45, cx, cy + 12, rx * 1.38);
        reefGrad.addColorStop(0, 'rgba(103, 232, 249, 0.95)');
        reefGrad.addColorStop(0.58, 'rgba(34, 211, 238, 0.65)');
        reefGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = reefGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14, rx * 1.38, ry * 1.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, rx * 1.12, ry * 1.14, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FDE68A';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, rx * 1.06, ry * 1.08, 0, 0, Math.PI * 2);
        ctx.fill();

        const cliffGrad = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
        cliffGrad.addColorStop(0, '#A8A29E');
        cliffGrad.addColorStop(0.45, '#57534E');
        cliffGrad.addColorStop(1, '#292524');
        ctx.fillStyle = cliffGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, rx, ry * 0.96, 0, 0, Math.PI * 2);
        ctx.fill();

        const grassGrad = ctx.createRadialGradient(cx - 20, cy - 22, 10, cx, cy - 10, rx * 0.98);
        grassGrad.addColorStop(0, '#86EFAC');
        grassGrad.addColorStop(0.5, '#16A34A');
        grassGrad.addColorStop(1, '#14532D');
        ctx.fillStyle = grassGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 12, rx * 0.95, ry * 0.84, 0, 0, Math.PI * 2);
        ctx.fill();

        if (type === 1) {
          ctx.fillStyle = '#CBD5E1';
          ctx.beginPath();
          ctx.ellipse(cx, cy - 24, 78, 32, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#64748B';
          ctx.beginPath();
          ctx.ellipse(cx, cy - 24, 62, 22, 0, 0, Math.PI * 2);
          ctx.fill();
          const portalG = ctx.createRadialGradient(cx, cy - 28, 4, cx, cy - 28, 38);
          portalG.addColorStop(0, '#FFFFFF');
          portalG.addColorStop(0.45, '#38BDF8');
          portalG.addColorStop(1, '#0284C7');
          ctx.fillStyle = portalG;
          ctx.beginPath();
          ctx.arc(cx, cy - 26, 32, Math.PI, 0);
          ctx.fill();
        } else if (type === 2) {
          const wfG = ctx.createLinearGradient(cx - 22, cy - 35, cx + 22, cy + 52);
          wfG.addColorStop(0, '#FFFFFF');
          wfG.addColorStop(0.5, '#38BDF8');
          wfG.addColorStop(1, '#E0F2FE');
          ctx.fillStyle = wfG;
          fillRoundedRect(ctx, cx - 24, cy - 26, 48, 74, 10);
          ctx.fill();
        } else if (type === 3) {
          ctx.fillStyle = '#78350F';
          fillRoundedRect(ctx, cx - 54, cy - 52, 108, 42, 10);
          ctx.fill();
          ctx.fillStyle = '#FEF08A';
          ctx.font = 'bold 28px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('♫', cx, cy - 22);
        } else if (type === 4) {
          ctx.fillStyle = '#D97706';
          ctx.beginPath();
          ctx.ellipse(cx, cy - 22, 68, 28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FDE68A';
          ctx.beginPath();
          ctx.ellipse(cx, cy - 22, 52, 19, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 5) {
          ctx.fillStyle = '#991B1B';
          fillRoundedRect(ctx, cx - 54, cy - 52, 108, 40, 8);
          ctx.fill();
          ctx.fillStyle = '#FEF08A';
          ctx.font = 'bold 26px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('𝄞', cx, cy - 20);
        }

        [-rx * 0.68, -rx * 0.42, rx * 0.42, rx * 0.68].forEach((ox, idx) => {
          const pyOff = idx % 2 === 0 ? -10 : -22;
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(cx + ox, cy + pyOff);
          ctx.quadraticCurveTo(cx + ox * 1.08, cy + pyOff - 24, cx + ox * 1.15, cy + pyOff - 40);
          ctx.stroke();
          ctx.fillStyle = idx % 2 === 0 ? '#15803D' : '#22C55E';
          ctx.beginPath();
          ctx.arc(cx + ox * 1.15, cy + pyOff - 42, 14, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      drawIsland(235, 340, 152, 62, 1);
      drawIsland(640, 265, 160, 64, 2);
      drawIsland(1045, 340, 152, 62, 3);
      drawIsland(430, 560, 150, 58, 4);
      drawIsland(855, 560, 150, 58, 5);
      return;
    }

    const stg = SLIDE_META[slideNum]?.stage || 0;
    const stageThemes: Record<
      number,
      { skyTop: string; skyMid: string; skyBot: string; sun: string; hill1: string; hill2: string }
    > = {
      0: { skyTop: '#0284C7', skyMid: '#38BDF8', skyBot: '#FEF9C3', sun: '#FEF08A', hill1: '#15803D', hill2: '#16A34A' },
      1: { skyTop: '#0284C7', skyMid: '#7DD3FC', skyBot: '#FEF3C7', sun: '#FDE047', hill1: '#16A34A', hill2: '#22C55E' },
      2: { skyTop: '#0369A1', skyMid: '#10B981', skyBot: '#D1FAE5', sun: '#FEF08A', hill1: '#047857', hill2: '#059669' },
      3: { skyTop: '#78350F', skyMid: '#B45309', skyBot: '#FEF3C7', sun: '#FBBF24', hill1: '#451A03', hill2: '#78350F' },
      4: { skyTop: '#31102F', skyMid: '#6B21A8', skyBot: '#FDE68A', sun: '#F59E0B', hill1: '#3B0764', hill2: '#581C87' },
      5: { skyTop: '#1E1B4B', skyMid: '#BE123C', skyBot: '#FEF08A', sun: '#FACC15', hill1: '#15803D', hill2: '#166534' },
    };
    const th = stageThemes[stg] || stageThemes[0];

    const skyG = ctx.createLinearGradient(0, 0, 0, H);
    skyG.addColorStop(0, th.skyTop);
    skyG.addColorStop(0.55, th.skyMid);
    skyG.addColorStop(1, th.skyBot);
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, W, H);

    const sunG = ctx.createRadialGradient(W * 0.5, H * 0.28, 15, W * 0.5, H * 0.28, 520);
    sunG.addColorStop(0, '#FFFFFF');
    sunG.addColorStop(0.28, th.sun);
    sunG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sunG;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = th.hill1;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.65);
    ctx.quadraticCurveTo(W * 0.28, H * 0.5, W * 0.55, H * 0.64);
    ctx.quadraticCurveTo(W * 0.82, H * 0.76, W, H * 0.58);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = th.hill2;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.74);
    ctx.quadraticCurveTo(W * 0.35, H * 0.62, W * 0.7, H * 0.73);
    ctx.quadraticCurveTo(W * 0.88, H * 0.8, W, H * 0.68);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = stg === 3 ? '#78350F' : '#D6D3D1';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);

    if (slideNum === 1) {
      ctx.save();
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 68;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.56, 250, Math.PI, 0);
      ctx.stroke();

      const portalGlow = ctx.createRadialGradient(W * 0.5, H * 0.54, 20, W * 0.5, H * 0.54, 225);
      portalGlow.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      portalGlow.addColorStop(0.45, 'rgba(56, 189, 248, 0.8)');
      portalGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = portalGlow;
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.54, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.12, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (stg === 1) {
      ctx.fillStyle = '#FEF3C7';
      fillRoundedRect(ctx, 90, H * 0.36, 260, 180, 12);
      ctx.fill();
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(70, H * 0.36);
      ctx.lineTo(220, H * 0.22);
      ctx.lineTo(370, H * 0.36);
      ctx.closePath();
      ctx.fill();
    } else if (stg === 2) {
      const wf = ctx.createLinearGradient(W * 0.72, H * 0.25, W * 0.84, H * 0.82);
      wf.addColorStop(0, '#FFFFFF');
      wf.addColorStop(0.5, '#38BDF8');
      wf.addColorStop(1, '#BAE6FD');
      ctx.fillStyle = wf;
      fillRoundedRect(ctx, W * 0.72, H * 0.25, 135, H * 0.56, 20);
      ctx.fill();
    } else if (stg === 3) {
      [0.2, 0.4, 0.6, 0.8].forEach((rx) => {
        const lg = ctx.createRadialGradient(W * rx, 95, 4, W * rx, 95, 85);
        lg.addColorStop(0, '#FEF08A');
        lg.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(W * rx, 95, 85, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (stg === 4) {
      [120, 260, W - 260, W - 120].forEach((px) => {
        ctx.fillStyle = '#A8A29E';
        fillRoundedRect(ctx, px - 24, H * 0.24, 48, H * 0.58, 8);
        ctx.fill();
        const fg = ctx.createRadialGradient(px, H * 0.22, 4, px, H * 0.22, 42);
        fg.addColorStop(0, '#FEF08A');
        fg.addColorStop(0.5, '#F97316');
        fg.addColorStop(1, 'rgba(239,68,68,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(px, H * 0.22, 42, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (stg === 5) {
      for (let i = 1; i <= 11; i++) {
        const lx = (W / 12) * i;
        const ly = 75 + Math.sin(i * 0.8) * 22;
        ctx.fillStyle = i % 2 === 0 ? '#FEF08A' : '#38BDF8';
        ctx.beginPath();
        ctx.arc(lx, ly, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 24; i++) {
      const px = ((i * 197 + slideNum * 83) % (W - 80)) + 40;
      const py = ((i * 131 + slideNum * 47) % (H - 120)) + 50;
      const r = (i % 3) + 2;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.72)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [slideNum, isStage1, isStage2, isStage3, isStage4, isStage5]);

  if (isStage1 || isStage2 || isStage3 || isStage4 || isStage5) {
    const bgSrc = isStage1
      ? customVisuals?.stage1_bg || DEFAULT_STAGE1_BG
      : isStage2
        ? customVisuals?.stage2_bg || DEFAULT_STAGE2_BG
        : isStage3
          ? customVisuals?.stage3_bg || DEFAULT_STAGE3_BG
          : isStage4
            ? customVisuals?.stage4_bg || DEFAULT_STAGE4_BG
            : customVisuals?.stage5_bg || DEFAULT_STAGE5_BG;
    const bgAlt = isStage1
      ? 'Latar Belakang Stage 1 - Mengenal Dunia Bunyi'
      : isStage2
        ? 'Latar Belakang Stage 2 - Sumber & Sifat Bunyi'
        : isStage3
          ? 'Latar Belakang Stage 3 - Eksperimen Bunyi'
          : isStage4
            ? 'Latar Belakang Stage 4 - Bunyi dalam Kehidupan'
            : 'Latar Belakang Stage 5 - Kreasi Musik Sederhana';
    return (
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgSrc}
          alt={bgAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/15" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover" />
    </div>
  );
};
