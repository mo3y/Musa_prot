'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Matrix Code Rain ────────────────────────────────────────────────────────
function MatrixRain({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const fontSize = 13;
    const cols = Math.floor(width / fontSize);
    const drops: number[] = Array(cols).fill(1).map(() => Math.random() * -50);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>{}[]!@#$%^&*01';

    let raf: number;
    let lastTime = 0;
    const interval = 55;

    function draw(ts: number) {
      if (ts - lastTime < interval) { raf = requestAnimationFrame(draw); return; }
      lastTime = ts;

      // Fade trail
      ctx!.fillStyle = 'rgba(2, 4, 8, 0.18)';
      ctx!.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        const brightness = Math.random();
        if (brightness > 0.95) {
          // Bright head character
          ctx!.fillStyle = `rgba(180, 255, 200, ${0.9 + Math.random() * 0.1})`;
        } else if (brightness > 0.7) {
          ctx!.fillStyle = `rgba(0, 220, 80, ${0.6 + Math.random() * 0.3})`;
        } else {
          ctx!.fillStyle = `rgba(0, 140, 50, ${0.2 + Math.random() * 0.4})`;
        }

        ctx!.font = `${fontSize}px 'JetBrains Mono', monospace`;
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx!.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.6;
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.55,
      }}
    />
  );
}

// ─── Network Topology ─────────────────────────────────────────────────────────
interface NetNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'server' | 'firewall' | 'endpoint' | 'attacker' | 'router';
  status: 'safe' | 'under-attack' | 'blocked' | 'compromised';
}

const NET_NODES: NetNode[] = [
  { id: 'fw',   x: 50,  y: 50,  label: 'FIREWALL',  type: 'firewall',  status: 'safe' },
  { id: 'srv1', x: 25,  y: 25,  label: 'WEB SERVER', type: 'server',   status: 'safe' },
  { id: 'srv2', x: 75,  y: 25,  label: 'DB SERVER',  type: 'server',   status: 'safe' },
  { id: 'ep1',  x: 15,  y: 70,  label: 'ENDPOINT',   type: 'endpoint', status: 'safe' },
  { id: 'ep2',  x: 40,  y: 80,  label: 'WORKSTATION',type: 'endpoint', status: 'safe' },
  { id: 'ep3',  x: 65,  y: 75,  label: 'LAPTOP',     type: 'endpoint', status: 'safe' },
  { id: 'rtr',  x: 85,  y: 55,  label: 'ROUTER',     type: 'router',   status: 'safe' },
  { id: 'atk',  x: 90,  y: 20,  label: 'THREAT',     type: 'attacker', status: 'under-attack' },
];

const CONNECTIONS = [
  ['fw', 'srv1'], ['fw', 'srv2'], ['fw', 'ep1'], ['fw', 'ep2'],
  ['fw', 'ep3'], ['fw', 'rtr'], ['srv1', 'srv2'], ['rtr', 'atk'],
];

function nodeColor(type: NetNode['type'], status: NetNode['status']): string {
  if (status === 'under-attack') return '#FF4500';
  if (status === 'blocked') return '#00D4FF';
  if (status === 'compromised') return '#FF0040';
  switch (type) {
    case 'firewall':  return '#00D4FF';
    case 'server':    return '#0055FF';
    case 'endpoint':  return '#4A7A8A';
    case 'router':    return '#00aacc';
    case 'attacker':  return '#FF4500';
  }
}

function nodeIcon(type: NetNode['type']): string {
  switch (type) {
    case 'firewall':  return '🛡';
    case 'server':    return '⬛';
    case 'endpoint':  return '💻';
    case 'router':    return '⬡';
    case 'attacker':  return '⚡';
  }
}

interface AttackLine {
  id: number;
  fromId: string;
  toId: string;
  progress: number;
  blocked: boolean;
  color: string;
}

function NetworkTopology({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const attacksRef = useRef<AttackLine[]>([]);
  const rafRef = useRef<number>(0);
  const nextAttackRef = useRef(2000);
  const startTimeRef = useRef(performance.now());
  let attackIdCounter = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    function px(x: number) { return (x / 100) * width; }
    function py(y: number) { return (y / 100) * height; }

    function spawnAttack() {
      const targets = NET_NODES.filter(n => n.type !== 'attacker' && n.type !== 'firewall');
      const target = targets[Math.floor(Math.random() * targets.length)];
      attacksRef.current.push({
        id: attackIdCounter++,
        fromId: 'atk',
        toId: 'fw',
        progress: 0,
        blocked: true,
        color: '#FF4500',
      });
    }

    function draw(ts: number) {
      const elapsed = ts - startTimeRef.current;
      ctx!.clearRect(0, 0, width, height);

      // Draw connections
      CONNECTIONS.forEach(([a, b]) => {
        const na = NET_NODES.find(n => n.id === a)!;
        const nb = NET_NODES.find(n => n.id === b)!;
        ctx!.beginPath();
        ctx!.moveTo(px(na.x), py(na.y));
        ctx!.lineTo(px(nb.x), py(nb.y));
        ctx!.strokeStyle = 'rgba(0,212,255,0.15)';
        ctx!.lineWidth = 1;
        ctx!.stroke();
      });

      // Draw attack lines
      if (elapsed > nextAttackRef.current) {
        spawnAttack();
        nextAttackRef.current = elapsed + 1500 + Math.random() * 2000;
      }

      attacksRef.current = attacksRef.current.filter(atk => {
        atk.progress += 0.012;

        const from = NET_NODES.find(n => n.id === atk.fromId)!;
        const to = NET_NODES.find(n => n.id === atk.toId)!;
        const fx = px(from.x), fy = py(from.y);
        const tx = px(to.x),  ty = py(to.y);

        // Block at 55% for firewall
        const maxP = atk.blocked ? 0.55 : 1.0;
        const p = Math.min(atk.progress, maxP);
        const cx2 = fx + (tx - fx) * p;
        const cy2 = fy + (ty - fy) * p;

        // Trail
        ctx!.beginPath();
        ctx!.moveTo(fx, fy);
        ctx!.lineTo(cx2, cy2);
        const grad = ctx!.createLinearGradient(fx, fy, cx2, cy2);
        grad.addColorStop(0, 'rgba(255,69,0,0)');
        grad.addColorStop(0.7, 'rgba(255,69,0,0.4)');
        grad.addColorStop(1, '#FF4500');
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = '#FF4500';
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        // Head particle
        ctx!.beginPath();
        ctx!.arc(cx2, cy2, 3.5, 0, Math.PI * 2);
        ctx!.fillStyle = '#FF4500';
        ctx!.shadowBlur = 12;
        ctx!.shadowColor = '#FF4500';
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Block flash at firewall
        if (atk.progress >= 0.55 && atk.blocked) {
          const alpha = Math.max(0, 1 - (atk.progress - 0.55) * 8);
          ctx!.beginPath();
          ctx!.arc(cx2, cy2, 14 * (1 - alpha * 0.3), 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(0,212,255,${alpha * 0.9})`;
          ctx!.lineWidth = 2;
          ctx!.shadowBlur = 20;
          ctx!.shadowColor = '#00D4FF';
          ctx!.stroke();
          ctx!.shadowBlur = 0;

          // BLOCKED text
          if (alpha > 0.3) {
            ctx!.font = 'bold 9px JetBrains Mono, monospace';
            ctx!.fillStyle = `rgba(0,212,255,${alpha})`;
            ctx!.fillText('BLOCKED', cx2 - 24, cy2 - 18);
          }
        }

        return atk.progress < 1.2;
      });

      // Draw nodes
      NET_NODES.forEach(node => {
        const x = px(node.x), y = py(node.y);
        const color = nodeColor(node.type, node.status);
        const r = node.type === 'firewall' ? 14 : node.type === 'attacker' ? 12 : 9;

        // Pulse ring for attacker
        if (node.type === 'attacker') {
          const pulse = (Math.sin(elapsed * 0.004) * 0.5 + 0.5);
          ctx!.beginPath();
          ctx!.arc(x, y, r + 8 + pulse * 6, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(255,69,0,${0.3 * (1 - pulse * 0.5)})`;
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
        }

        // Node fill
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fillStyle = color + '22';
        ctx!.fill();
        ctx!.strokeStyle = color;
        ctx!.lineWidth = node.type === 'firewall' ? 2 : 1.5;
        ctx!.shadowBlur = 12;
        ctx!.shadowColor = color;
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        // Label
        ctx!.font = '8px JetBrains Mono, monospace';
        ctx!.fillStyle = color;
        ctx!.textAlign = 'center';
        ctx!.fillText(node.label, x, y + r + 12);
        ctx!.textAlign = 'left';
      });

      // Scan line
      const scanY = (elapsed * 0.06) % height;
      ctx!.fillStyle = 'rgba(0,212,255,0.025)';
      ctx!.fillRect(0, scanY, width, 2);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: 'moe@kali:~$ nmap -sV -sC -O 192.168.1.0/24', delay: 0,    color: '#00D4FF' },
  { text: 'Starting Nmap 7.94 ( https://nmap.org )',      delay: 600,  color: '#4A7A8A' },
  { text: 'Scanning 256 hosts [1000 ports/host]',         delay: 900,  color: '#4A7A8A' },
  { text: 'Discovered open port 22/tcp on 192.168.1.5',   delay: 1400, color: '#00ff88' },
  { text: 'Discovered open port 80/tcp on 192.168.1.12',  delay: 1700, color: '#00ff88' },
  { text: 'PORT     STATE  SERVICE   VERSION',             delay: 2200, color: '#E8F4F8' },
  { text: '22/tcp   open   ssh       OpenSSH 9.3',         delay: 2300, color: '#E8F4F8' },
  { text: '80/tcp   open   http      nginx 1.24.0',        delay: 2400, color: '#E8F4F8' },
  { text: '443/tcp  open   ssl/https',                     delay: 2500, color: '#E8F4F8' },
  { text: 'moe@kali:~$ sudo arp-scan -l',                 delay: 3200, color: '#00D4FF' },
  { text: '192.168.1.1   00:11:22:aa:bb:cc  ROUTER',       delay: 3800, color: '#4A7A8A' },
  { text: '192.168.1.5   00:de:ad:be:ef:01  SERVER',       delay: 3900, color: '#4A7A8A' },
  { text: 'moe@kali:~$ maltego -s target.com',             delay: 4600, color: '#00D4FF' },
  { text: '[OSINT] Resolving DNS records...',              delay: 5000, color: '#FFB340' },
  { text: '[OSINT] Found 4 subdomains, 2 email patterns',  delay: 5400, color: '#FFB340' },
  { text: 'moe@kali:~$ python3 recon.py --target 10.0.1.5',delay: 6200, color: '#00D4FF' },
  { text: '[*] Initiating passive recon sequence',         delay: 6600, color: '#4A7A8A' },
  { text: '[+] CVE-2023-44487 detected — HTTP/2 RapidReset',delay:7000, color: '#FF4500' },
  { text: '[!] ALERT: Anomalous traffic pattern blocked',  delay: 7500, color: '#FF4500' },
  { text: 'moe@kali:~$ ssh -i ~/.ssh/key admin@192.168.1.5',delay:8200,color: '#00D4FF' },
  { text: 'Welcome to Ubuntu 22.04.3 LTS (GNU/Linux)',     delay: 8700, color: '#00ff88' },
  { text: 'Last login: Tue Mar 21 22:14:07 from 10.0.0.2', delay: 8800, color: '#4A7A8A' },
  { text: 'admin@server:~$ cat /etc/passwd | grep -v nologin',delay:9400,color:'#00D4FF'},
  { text: 'admin@server:~$ netstat -tulpn | grep LISTEN',  delay: 10000,color: '#00D4FF'},
  { text: 'tcp6  0  0 :::22  :::*  LISTEN  1192/sshd',    delay: 10300,color: '#E8F4F8'},
  { text: 'tcp6  0  0 :::80  :::*  LISTEN  1287/nginx',   delay: 10400,color: '#E8F4F8'},
];

function Terminal({ visible }: { visible: boolean }) {
  const [visibleLines, setVisibleLines] = useState<typeof TERMINAL_LINES>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!visible) return;
    setVisibleLines([]);

    let base = 0;
    function scheduleLines(offset: number) {
      const timers = TERMINAL_LINES.map((line) => {
        const t = setTimeout(() => {
          setVisibleLines(prev => {
            const next = [...prev, line];
            // Keep at most 14 lines visible
            return next.slice(-14);
          });
          setTimeout(() => {
            scrollRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
          }, 30);
        }, offset + line.delay);
        cycleRef.current.push(t);
        return t;
      });

      // Restart after full cycle
      const total = Math.max(...TERMINAL_LINES.map(l => l.delay)) + 2500;
      const restart = setTimeout(() => {
        setVisibleLines([]);
        scheduleLines(0);
      }, offset + total);
      cycleRef.current.push(restart);
    }

    scheduleLines(0);
    return () => { cycleRef.current.forEach(clearTimeout); cycleRef.current = []; };
  }, [visible]);

  return (
    <div style={{
      background: 'rgba(1,3,6,0.95)',
      border: '1px solid rgba(0,212,255,0.2)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Terminal titlebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(0,212,255,0.04)',
        flexShrink: 0,
      }}>
        {['#ff5f57','#ffbd2e','#28ca41'].map((c,i)=>(
          <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }} />
        ))}
        <span style={{
          fontFamily:'var(--font-jetbrains)',
          fontSize:'10px',
          color:'#4A7A8A',
          marginLeft:'10px',
          letterSpacing:'2px',
        }}>
          root@kali — moe — bash
        </span>
        <motion.div
          animate={{ opacity:[1,0,1] }}
          transition={{ duration:2, repeat:Infinity }}
          style={{
            marginLeft:'auto',
            width:6, height:6,
            borderRadius:'50%',
            background:'#00ff88',
            boxShadow:'0 0 8px #00ff88',
          }}
        />
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleLines.map((line, i) => (
            <motion.div
              key={`${line.text}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '11px',
                color: line.color,
                lineHeight: 1.6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'11px', color:'#00D4FF' }}>
            moe@kali:~$
          </span>
          <motion.div
            animate={{ opacity:[1,0,1] }}
            transition={{ duration:0.8, repeat:Infinity }}
            style={{ width:7, height:13, background:'#00D4FF', boxShadow:'0 0 8px #00D4FF' }}
          />
        </div>
      </div>

      {/* Scanline overlay */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.012) 3px, rgba(0,212,255,0.012) 4px)',
        pointerEvents:'none',
      }}/>
    </div>
  );
}

// ─── Skill Tags ───────────────────────────────────────────────────────────────
const SKILL_GROUPS = [
  {
    label: 'LANGUAGES',
    color: '#00D4FF',
    skills: ['Python', 'Java', 'C++', 'HTML', 'CSS'],
  },
  {
    label: 'SYSTEMS & INFRA',
    color: '#0055FF',
    skills: ['Linux', 'VMware', 'Virtual Machines', 'Git', 'VS Code'],
  },
  {
    label: 'SECURITY',
    color: '#FF4500',
    skills: ['Maltego', 'OSINT', 'Cybersecurity Fundamentals', 'Networking', 'Virtualization'],
  },
  {
    label: 'AI & DATA',
    color: '#00D4FF',
    skills: ['AI & LLMs', 'OOP', 'Data Structures'],
  },
];

// ─── Main HackerScene export ──────────────────────────────────────────────────
export default function HackerScene({ visible }: { visible: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 440 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: Math.floor(r.width), h: Math.floor(r.height) });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px', height:'600px' }}>

      {/* Left: Matrix rain + network topology */}
      <div
        ref={containerRef}
        style={{ position:'relative', overflow:'hidden', background:'rgba(0,8,2,0.97)' }}
      >
        {dims.w > 0 && <MatrixRain width={dims.w} height={dims.h} />}
        {dims.w > 0 && <NetworkTopology width={dims.w} height={dims.h} />}

        {/* Glitch overlay */}
        <motion.div
          animate={{ opacity:[0, 0, 0, 0.06, 0, 0] }}
          transition={{ duration:4, repeat:Infinity, times:[0,0.3,0.5,0.52,0.54,1] }}
          style={{
            position:'absolute', inset:0,
            background:'rgba(0,212,255,0.08)',
            pointerEvents:'none',
          }}
        />

        {/* Top label */}
        <div style={{
          position:'absolute', top:12, left:12,
          fontFamily:'var(--font-jetbrains)',
          fontSize:'9px',
          color:'rgba(0,212,255,0.7)',
          letterSpacing:'3px',
          textTransform:'uppercase',
          background:'rgba(2,4,8,0.7)',
          padding:'4px 10px',
          border:'1px solid rgba(0,212,255,0.2)',
        }}>
          NETWORK MONITOR · LIVE
        </div>
      </div>

      {/* Right: Terminal + skill tags */}
      <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
        {/* Terminal (top 60%) */}
        <div style={{ flex:'0 0 60%' }}>
          <Terminal visible={visible} />
        </div>

        {/* Skill tags (bottom 40%) */}
        <div style={{
          flex:1,
          background:'rgba(2,4,8,0.98)',
          border:'1px solid rgba(0,212,255,0.1)',
          padding:'16px',
          overflow:'hidden',
        }}>
          <div style={{
            fontFamily:'var(--font-jetbrains)',
            fontSize:'9px',
            color:'#4A7A8A',
            letterSpacing:'3px',
            marginBottom:'12px',
            textTransform:'uppercase',
          }}>
            TECHNICAL STACK
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {SKILL_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{
                  fontFamily:'var(--font-jetbrains)',
                  fontSize:'9px',
                  color:group.color,
                  letterSpacing:'2px',
                  marginBottom:'5px',
                  opacity:0.8,
                }}>
                  {group.label}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                  {group.skills.map(skill => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale:1.05, borderColor:group.color }}
                      style={{
                        fontFamily:'var(--font-jetbrains)',
                        fontSize:'10px',
                        color: group.color,
                        padding:'3px 8px',
                        border:`1px solid ${group.color}33`,
                        background:`${group.color}0d`,
                        letterSpacing:'0.5px',
                        cursor:'default',
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
