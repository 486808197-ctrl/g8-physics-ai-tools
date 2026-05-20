/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waves, 
  Settings2, 
  Info, 
  Activity, 
  Navigation, 
  Wind, 
  Thermometer, 
  Droplets,
  ArrowDown,
  ArrowUp,
  Play,
  RotateCcw,
  Maximize2,
  Anchor,
  Cloudy
} from 'lucide-react';

// --- Constants & Types ---

const G_CONST = 10; // 重力加速度 (N/kg) 为简化计算取10

type SimulationTab = 'experiment' | 'submarine' | 'balloon' | 'hydrometer' | 'clay-boat';

interface Liquid {
  id: string;
  name: string;
  density: number; // g/cm³
  color: string;
}

const LIQUIDS: Liquid[] = [
  { id: 'water', name: '纯净水', density: 1.0, color: '#3b82f6' },
  { id: 'saltwater', name: '浓盐水', density: 1.2, color: '#1d4ed8' },
  { id: 'alcohol', name: '酒精', density: 0.8, color: '#93c5fd' },
  { id: 'oil', name: '植物油', density: 0.9, color: '#fbbf24' },
];

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<SimulationTab>('experiment');

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-[#141414]/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Waves size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">浮力探究实验室</h1>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#141414]/50">Physical Buoyancy Lab v1.0</p>
            </div>
          </div>

          <nav className="hidden lg:flex bg-[#141414]/5 p-1 rounded-full border border-[#141414]/5">
            {(['experiment', 'submarine', 'balloon', 'hydrometer', 'clay-boat'] as SimulationTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-[#141414]/60 hover:text-[#141414]'
                }`}
              >
                {tab === 'experiment' && '探究实验'}
                {tab === 'submarine' && '潜水艇'}
                {tab === 'balloon' && '热气球'}
                {tab === 'hydrometer' && '密度计'}
                {tab === 'clay-boat' && '橡皮泥小船'}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-[#141414]/40 hover:text-[#141414] transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
        {activeTab === 'experiment' && <ExperimentModule />}
        {activeTab === 'submarine' && <SubmarineModule />}
        {activeTab === 'balloon' && <BalloonModule />}
        {activeTab === 'hydrometer' && <HydrometerModule />}
        {activeTab === 'clay-boat' && <ClayBoatModule />}
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-[#141414]/10 bg-white/80 backdrop-blur-md px-6 py-2 flex items-center justify-between text-[11px] font-mono text-[#141414]/40 z-50">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Activity size={12} /> ENGINE: REAL-TIME CLOUD-PHYSICS</span>
          <span className="flex items-center gap-1.5"><Settings2 size={12} /> MODE: INTERACTIVE STUDENT SELF-STUDY</span>
        </div>
        <div className="flex gap-4">
          <span>COORDINATE SYST: CARTESIAN</span>
          <span>FLUID ENV: DYNAMIC</span>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-Modules ---

/**
 * 1. 探究实验模块 (改成三个物体：水气球、网球、石块，从而验证浮力与重力的关系)
 */

interface PhysicalObject {
  id: string;
  name: string;
  englishName: string;
  mass: number; // g
  volume: number; // cm³
  color: string;
  emoji: string;
  style: string;
  description: string;
}

const PRESET_OBJECTS: PhysicalObject[] = [
  {
    id: 'balloon',
    name: '水气球',
    englishName: 'Water Balloon',
    mass: 200,
    volume: 200,
    color: '#e879f9',
    emoji: '🎈',
    style: 'rounded-[48%] bg-gradient-to-tr from-purple-500/80 to-[#ec4899]/80 border-2 border-purple-400 shadow-xl backdrop-blur-[1px]',
    description: '水气球内部充满清水，整体平均密度约为 1.0 g/cm³，与水相同，极易展示“悬浮”现象。',
  },
  {
    id: 'tennis',
    name: '网球',
    englishName: 'Tennis Ball',
    mass: 58,
    volume: 150,
    color: '#bef264',
    emoji: '🎾',
    style: 'rounded-full bg-[#bef264] border-2 border-[#a3e635] shadow-lg flex items-center justify-center relative overflow-hidden',
    description: '网球内含有大量空气，其整体密度仅为约 0.39 g/cm³，远小于水的密度，在水中会“漂浮”。',
  },
  {
    id: 'stone',
    name: '石块',
    englishName: 'Stone',
    mass: 400,
    volume: 150,
    color: '#6b7280',
    emoji: '🪨',
    style: 'rounded-[35%_65%_45%_55%/55%_45%_65%_35%] bg-gradient-to-b from-gray-400 to-gray-600 border-2 border-gray-700 shadow-lg',
    description: '石块是致密的矿物实心体，密度高达 2.67 g/cm³，远大于水的密度，放入水中会立即“下沉”。',
  }
];

function interpolatePath(t: number, times: number[], values: number[]): number {
  if (t <= times[0]) return values[0];
  if (t >= times[times.length - 1]) return values[values.length - 1];
  for (let i = 0; i < times.length - 1; i++) {
    if (t >= times[i] && t <= times[i + 1]) {
      const fraction = (t - times[i]) / (times[i + 1] - times[i]);
      return values[i] + (values[i + 1] - values[i]) * fraction;
    }
  }
  return values[values.length - 1];
}

function ExperimentModule() {
  const [liquidId, setLiquidId] = useState(LIQUIDS[0].id);
  const [selectedObjectId, setSelectedObjectId] = useState('tennis');
  const [isReleased, setIsReleased] = useState(false);
  const [simState, setSimState] = useState<'idle' | 'moving' | 'stable'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const selectedLiquid = LIQUIDS.find(l => l.id === liquidId) || LIQUIDS[0];
  const activeObject = PRESET_OBJECTS.find(o => o.id === selectedObjectId) || PRESET_OBJECTS[0];

  const mass = activeObject.mass;
  const volume = activeObject.volume;
  const gravity = (mass * G_CONST) / 1000; // N
  const objectDensity = mass / volume; // g/cm³
  
  // 全排开时的最大浮力
  const maxBuoyancy = (selectedLiquid.density * G_CONST * volume) / 1000; // N

  // 判断状态
  const status = useMemo(() => {
    if (!isReleased) return '准备中';
    const diff = objectDensity - selectedLiquid.density;
    if (Math.abs(diff) < 0.02) return '悬浮';
    if (objectDensity < selectedLiquid.density) return '漂浮';
    return '下沉';
  }, [objectDensity, selectedLiquid.density, isReleased]);

  const handleRelease = () => {
    setIsReleased(true);
    setSimState('moving');
  };

  const reset = () => {
    setIsReleased(false);
    setSimState('idle');
    setElapsedTime(0);
  };

  // 1. 模拟过程中的高频时间滴答
  useEffect(() => {
    if (simState !== 'moving') {
      setElapsedTime(0);
      return;
    }

    let start = performance.now();
    let frameId: number;

    const tick = () => {
      const now = performance.now();
      const elapsed = (now - start) / 1000; // 转换为秒
      if (elapsed >= 2.5) {
        setElapsedTime(2.5);
        setSimState('stable');
      } else {
        setElapsedTime(elapsed);
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [simState]);

  // 2. 稳定后（漂浮或悬浮）保持轻量渲染以做微幅波动动画
  useEffect(() => {
    if (simState !== 'stable' || status === '下沉') return;

    let frameId: number;
    const loop = () => {
      setRenderTrigger(prev => prev + 1);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [simState, status]);

  // 实时高度 (百分比) 计算
  const getSimTop = () => {
    if (!isReleased) return 10;
    if (simState === 'moving') {
      if (status === '漂浮') {
        return interpolatePath(elapsedTime, [0, 0.3, 0.7, 1.2, 1.6, 2.0, 2.5], [10, 30, 55, 18, 34, 24, 27]);
      } else if (status === '悬浮') {
        return interpolatePath(elapsedTime, [0, 0.3, 0.8, 1.5, 2.5], [10, 30, 55, 46, 50]);
      } else {
        // 下沉
        return interpolatePath(elapsedTime, [0, 0.3, 0.9, 1.3, 1.9, 2.5], [10, 30, 78, 75, 78, 78]);
      }
    }
    
    // stable 状态的逼真微小呼吸浮动
    if (status === '漂浮') {
      return 27 + Math.sin(Date.now() / 400) * 0.6;
    } else if (status === '悬浮') {
      return 50 + Math.sin(Date.now() / 700) * 1.5 + Math.cos(Date.now() / 1100) * 0.4;
    } else {
      // 下沉
      return 78;
    }
  };

  const getSimX = () => {
    if (!isReleased) return 0;
    if (simState === 'moving') return 0;
    if (status === '漂浮') {
      return Math.sin(Date.now() / 380) * 2;
    } else if (status === '悬浮') {
      return Math.sin(Date.now() / 550) * 6;
    }
    return 0;
  };

  const getSimRotate = () => {
    if (!isReleased) return 0;
    if (simState === 'moving') {
      if (status === '漂浮') {
        return interpolatePath(elapsedTime, [0, 0.3, 0.7, 1.2, 1.6, 2.0, 2.5], [0, 5, -12, 10, -5, 2, 0]);
      } else if (status === '悬浮') {
        return interpolatePath(elapsedTime, [0, 0.3, 0.8, 1.5, 2.5], [0, 8, -6, 4, 0]);
      } else {
        return interpolatePath(elapsedTime, [0, 0.3, 0.9, 1.3, 1.9, 2.5], [0, 4, -2, 1, 0]);
      }
    }
    
    // stable bobs
    if (status === '漂浮') {
      return Math.sin(Date.now() / 320) * 1.2;
    } else if (status === '悬浮') {
      return Math.sin(Date.now() / 500) * 3.5;
    }
    return 0;
  };

  const simTop = getSimTop();
  const simX = getSimX();
  const simRotate = getSimRotate();

  // 根据当前位置计算排开体积和真实的瞬时物理浮力
  const getBuoyancy = () => {
    if (!isReleased) return 0; // 悬挂在空中时尚未入水，排开液重 F_浮 = 0 N
    if (simState === 'stable') {
      if (status === '漂浮' || status === '悬浮') {
        return gravity; // 平衡态条件：F_浮 = G
      }
      return maxBuoyancy; // 沉底状态：浮力等于最大排开液重 F_浮 = F_max
    }

    // 运动过程中，随着侵入液体纵深（浸没体积比例）动态、连续改变浮力
    const subStart = 20; // 刚开始触碰并渗入水面的高度
    const top_rest = status === '漂浮' ? 27 : (status === '悬浮' ? 50 : 78);
    const f_rest = status === '下沉' ? 1.0 : Math.min(1.0, gravity / maxBuoyancy);
    
    // 为使得 2.5秒 动作完全结束、稳定时完美吻合重力, 用物理平衡常数反推浸没边界
    const subEnd = subStart + (top_rest - subStart) / f_rest;
    
    const submersion = Math.max(0, Math.min(1, (simTop - subStart) / (subEnd - subStart)));
    return submersion * maxBuoyancy;
  };

  const buoyancy = getBuoyancy();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 虚拟水槽区域 */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="relative aspect-[4/3] bg-white rounded-3xl border border-[#141414]/10 shadow-2xl overflow-hidden group">
          {/* 水槽边框 */}
          <div className="absolute inset-0 border-8 border-gray-100 pointer-events-none z-10"></div>
          
          {/* 液体层 */}
          <motion.div 
            animate={{ backgroundColor: selectedLiquid.color }}
            className="absolute bottom-0 w-full opacity-30 origin-bottom"
            style={{ height: '70%' }}
          >
            {/* 水波纹动画 */}
            <motion.div 
              animate={{ x: [-100, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 left-0 w-[200%] h-4 bg-white/20 -translate-y-2 opacity-50 blur-sm"
              style={{ borderRadius: '50%' }}
            ></motion.div>
          </motion.div>

          {/* 刻度线 */}
          <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-[#141414]/5 flex flex-col justify-between py-12 text-[10px] font-mono text-[#141414]/20 z-0">
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-2 h-[1px] bg-current"></span> {1000 - i * 100}ml
              </span>
            ))}
          </div>

          {/* 物体 */}
          <motion.div
            style={{
              top: `${simTop}%`,
              left: `calc(50% + ${simX}px)`,
              transform: `translate(-50%, 0) rotate(${simRotate}deg)`,
            }}
            className="absolute flex items-center justify-center z-20"
          >
            <motion.div 
              style={{ 
                width: Math.sqrt(volume) * 9, 
                height: Math.sqrt(volume) * 9 
              }}
              className={`${activeObject.style} relative flex flex-col items-center justify-center`}
            >
              {/* 网球贴图辅助线 */}
              {activeObject.id === 'tennis' && (
                <div className="absolute inset-0 border border-white/40 rounded-full scale-90 border-dashed pointer-events-none" />
              )}

              <div className="text-white font-black text-sm drop-shadow-md z-10 text-center flex flex-col items-center justify-center">
                <span className="text-xl mb-0.5">{activeObject.emoji}</span>
                <span className="bg-black/35 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">{status}</span>
              </div>
              
              {/* 受力箭头 */}
              {/* 重力箭头 */}
              <div className="absolute top-1/2 left-1/2 flex flex-col items-center">
                <div className="h-[2px] w-2 bg-red-600 opacity-50"></div>
                <motion.div 
                  animate={{ height: gravity * 50 }}
                  className="w-[3px] bg-red-600 flex flex-col items-center relative"
                >
                  <ArrowDown className="absolute -bottom-4 text-red-600 animate-pulse" size={16} />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-red-600 text-[10px] font-bold bg-white/80 px-1 rounded border border-red-100">G = {gravity.toFixed(2)}N</span>
                </motion.div>
              </div>

              {/* 浮力箭头 */}
              <div className="absolute bottom-1/2 left-1/2 flex flex-col items-center">
                <motion.div 
                  animate={{ height: buoyancy * 50 }}
                  className="w-[3px] bg-green-600 flex flex-col items-center relative"
                >
                  <ArrowUp className="absolute -top-4 text-green-600 animate-pulse" size={16} />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-green-600 text-[10px] font-bold bg-white/80 px-1 rounded border border-green-100">F<sub>浮</sub> = {buoyancy.toFixed(2)}N</span>
                </motion.div>
                <div className="h-[2px] w-2 bg-green-600 opacity-50"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* 状态弹出 */}
          <AnimatePresence>
            {simState === 'stable' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl border border-[#141414]/10 shadow-xl z-30 w-11/12 max-w-md"
              >
                <p className="text-sm font-medium flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  状态判定: <span className="text-blue-600 font-extrabold text-lg">{status}</span>
                </p>
                <div className="mt-1.5 text-[11px] text-[#141414]/60 leading-relaxed font-sans">
                  {status === '漂浮' && (
                    <>
                      因为物体密度 <strong className="text-orange-500">ρ_物 ({objectDensity.toFixed(2)}g/cm³)</strong> 小于液体密度 <strong className="text-blue-500">ρ_液 ({selectedLiquid.density}g/cm³)</strong>，下浮一部分即可排开足够液体，达到受力平衡二力相等的条件。最终浮在表面且 <strong className="text-green-600">F_浮 = G</strong>。
                    </>
                  )}
                  {status === '悬浮' && (
                    <>
                      因为物体密度 <strong className="text-orange-500">ρ_物 ({objectDensity.toFixed(2)}g/cm³)</strong> 几乎完全等于液体密度 <strong className="text-blue-500">ρ_液 ({selectedLiquid.density}g/cm³)</strong>，在重力与排开液体最大浮力相齐平，可漂留在液体各纵深位置，具有 <strong className="text-green-600">F_浮 = G</strong> 条件。
                    </>
                  )}
                  {status === '下沉' && (
                    <>
                      因为物体密度 <strong className="text-orange-500">ρ_物 ({objectDensity.toFixed(2)}g/cm³)</strong> 大于液体密度 <strong className="text-blue-500">ρ_液 ({selectedLiquid.density}g/cm³)</strong>，即便全部浸入液体中，最大浮力 <strong className="text-green-600">F_浮 ({buoyancy.toFixed(2)}N)</strong> 依然小于自重 <strong className="text-red-500">G ({gravity.toFixed(2)}N)</strong>，从而直接落向水槽底部。
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部控制栏 - 改为优雅的对象选择、介质选择以及操控组件 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-3xl border border-[#141414]/10 shadow-sm">
          {/* 物体选择 */}
          <div className="md:col-span-6 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#141414]/40 font-bold">1. 选择探究物体 Select Object</span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_OBJECTS.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => { setSelectedObjectId(obj.id); reset(); }}
                  className={`py-3 px-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedObjectId === obj.id
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm ring-2 ring-blue-100'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-700 bg-white'
                  }`}
                >
                  <span className="text-2xl">{obj.emoji}</span>
                  <span className="text-xs font-extrabold">{obj.name}</span>
                  <span className="text-[9px] font-mono opacity-55">{obj.mass}g / {obj.volume}cm³</span>
                </button>
              ))}
            </div>
          </div>

          {/* 液体环境选择 */}
          <div className="md:col-span-3 bg-white p-3 rounded-2xl border border-gray-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#141414]/40 font-bold mb-1.5">2. 液体介质 Environment</span>
            <select 
              value={liquidId} onChange={(e) => { setLiquidId(e.target.value); reset(); }}
              className="text-xs font-bold bg-transparent border-none appearance-none cursor-pointer focus:ring-0 text-[#141414] py-1"
            >
              {LIQUIDS.map(l => (
                <option key={l.id} value={l.id}>{l.name} (ρ={l.density}g/cm³)</option>
              ))}
            </select>
          </div>

          {/* 引导执行与仿真控制 */}
          <div className="md:col-span-3 flex items-center gap-2">
            {!isReleased ? (
              <button 
                onClick={handleRelease}
                className="w-full h-full min-h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center transition-all shadow-lg shadow-blue-250 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play size={18} className="mb-0.5" />
                <span className="text-xs">物理释放 Simulate</span>
              </button>
            ) : (
              <button 
                onClick={reset}
                className="w-full h-full min-h-[52px] bg-[#141414] hover:bg-gray-950 text-white rounded-2xl font-bold flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw size={18} className="mb-0.5" />
                <span className="text-xs">重置环境 Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 数据看板 (Dashboard) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#141414]/5 pb-4">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-tight">
              <Activity size={18} className="text-blue-600" />
              数据看板
            </h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-mono border border-blue-100">REALTIME</span>
          </div>

          <div className="space-y-4">
            <DataRow label="液体密度 ρ_液" value={selectedLiquid.density} unit="g/cm³" color="text-blue-600" />
            <DataRow label="物体密度 ρ_物" value={objectDensity.toFixed(2)} unit="g/cm³" color={objectDensity > selectedLiquid.density ? "text-red-500" : "text-green-500"} />
            <div className="h-[1px] bg-[#141414]/5"></div>
            <DataRow label="物体重量 G" value={gravity.toFixed(2)} unit="N" />
            <DataRow label="当前浮力 F_浮" value={buoyancy.toFixed(2)} unit="N" color="text-green-600" />
            <DataRow label="排开液体体积 V_排" value={isReleased ? (buoyancy * 1000 / (selectedLiquid.density * G_CONST)).toFixed(1) : "待测"} unit="cm³" />
          </div>

          <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="text-[10px] uppercase font-mono font-bold text-blue-600 mb-2">当前所选物体简介</h4>
            <p className="text-xs text-[#141414]/70 leading-relaxed font-sans">{activeObject.description}</p>
          </div>

          <div className="mt-1 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <h4 className="text-[10px] uppercase font-mono font-bold text-blue-700 mb-2">浮沉关键判断法</h4>
            <ul className="text-[11px] space-y-2 text-[#141414]/70 leading-relaxed">
              <li className="flex gap-1">
                <span className="text-blue-600 font-bold">1.</span>
                <span>二力平衡定律：漂浮与悬浮状态下，浮力一定等于重力 <strong>(F_浮 = G)</strong>。</span>
              </li>
              <li className="flex gap-1">
                <span className="text-blue-600 font-bold">2.</span>
                <span>浮沉状态核心在于：</span>
              </li>
              <li className="pl-4 text-[10px] text-gray-500 font-mono">
                · F_浮(最大) &gt; G → 上浮 (最终漂浮)<br/>
                · F_浮(最大) = G → 悬浮<br/>
                · F_浮(最大) &lt; G → 下沉 (最终沉底)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. 潜水艇模型
 */
function SubmarineModule() {
  const [ballastWater, setBallastWater] = useState(50); // 0-100%
  const subVolume = 1000; // cm³ (固定)
  const emptyMass = 800; // g (潜水艇自重)
  const liquidDensity = 1.0; // 水中

  const currentMass = emptyMass + ballastWater * 4; // 模拟加水增加质量
  const gravity = (currentMass * G_CONST) / 1000;
  const maxBuoyancy = (liquidDensity * G_CONST * subVolume) / 1000;
  
  const netForce = maxBuoyancy - gravity;
  
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-[#141414]/10 p-8 shadow-2xl relative overflow-hidden h-[400px]">
        <div className="absolute inset-0 bg-blue-400 opacity-20 pointer-events-none"></div>
        
        {/* 潜水艇主体 */}
        <motion.div 
          animate={{ 
            y: netForce > 0.05 ? -100 : netForce < -0.05 ? 100 : 0,
            rotate: netForce * 5 
          }}
          transition={{ type: "spring", damping: 20 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-gray-700 rounded-full flex items-center justify-center text-white border-4 border-gray-600 shadow-xl"
        >
          <div className="flex flex-col items-center">
            <Anchor size={32} />
            <span className="text-[10px] font-mono mt-2 uppercase tracking-widest">SUB-MD 01</span>
          </div>
          
          {/* 水舱可视化 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/40 rounded-full overflow-hidden border border-white/20">
            <motion.div 
              animate={{ width: `${ballastWater}%` }}
              className="h-full bg-blue-500 opacity-80"
            ></motion.div>
          </div>

          {/* 受力显示 */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-green-400">
            <ArrowUp size={24} />
            <span className="text-[10px] font-bold">F_浮 = {maxBuoyancy.toFixed(1)}N</span>
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-red-400">
            <span className="text-[10px] font-bold">G = {gravity.toFixed(1)}N</span>
            <ArrowDown size={24} />
          </div>
        </motion.div>

        {/* 说明文字 */}
        <div className="absolute top-6 left-6 max-w-xs">
          <h3 className="font-bold text-lg mb-2">潜水艇浮沉原理</h3>
          <p className="text-xs text-[#141414]/60 leading-relaxed">
            潜水艇体积固定，受到的浮力基本不变。通过向水舱加水或排水，改变潜水艇的<strong>总重力</strong>，从而实现下潜、上浮或悬浮。
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <label className="font-bold flex items-center gap-2">
            <Maximize2 size={18} className="text-blue-600" />
            水舱调节 (排水 &lt;---&gt; 加水)
          </label>
          <span className="font-mono text-blue-600">{ballastWater}%</span>
        </div>
        <input 
          type="range" min="0" max="100" 
          value={ballastWater} onChange={(e) => setBallastWater(Number(e.target.value))}
          className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
        />
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className={`p-4 rounded-2xl transition-colors ${netForce > 0.05 ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
            <p className="text-[10px] font-mono mb-1">上浮</p>
            <p className="font-bold text-sm">F_浮 &gt; G</p>
          </div>
          <div className={`p-4 rounded-2xl transition-colors ${Math.abs(netForce) <= 0.05 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
            <p className="text-[10px] font-mono mb-1">悬浮</p>
            <p className="font-bold text-sm">F_浮 = G</p>
          </div>
          <div className={`p-4 rounded-2xl transition-colors ${netForce < -0.05 ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
            <p className="text-[10px] font-mono mb-1">下沉</p>
            <p className="font-bold text-sm">F_浮 &lt; G</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. 热气球模型
 */
function BalloonModule() {
  const [temp, setTemp] = useState(20); // 摄氏度
  const airDensityCold = 1.29; // 外界冷空气密度 kg/m³
  const hotAirDensity = 1.29 * (273 + 20) / (273 + temp); // 简化理想气体密度计算 kg/m³
  const balloonVolume = 2000; // m³
  const structureMass = 1.8; // kg (球皮、篮子、人)
  
  const buoyancy = airDensityCold * balloonVolume * G_CONST; // 排开空气受到的浮力 (N)
  const totalMass = structureMass + (hotAirDensity * balloonVolume);
  const gravity = totalMass * G_CONST;
  
  const lift = buoyancy - gravity;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-b from-sky-400 to-sky-100 rounded-3xl border border-[#141414]/10 p-8 shadow-2xl relative overflow-hidden h-[500px]">
        {/* 背景云朵 */}
        <Cloudy className="absolute top-20 left-10 text-white/40" size={80} />
        <Cloudy className="absolute top-40 right-20 text-white/60" size={120} />
        
        {/* 热气球 */}
        <motion.div 
          animate={{ 
            y: lift > 50 ? -150 : lift < -50 ? 100 : 0,
          }}
          transition={{ duration: 2 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        >
          {/* 球体 */}
          <motion.div 
            animate={{ backgroundColor: temp > 60 ? '#ef4444' : '#f97316' }}
            className="w-48 h-60 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] shadow-2xl relative"
          >
            {/* 内部火苗 */}
            <AnimatePresence>
              {temp > 40 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white"
                >
                  <Wind size={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* 绳索与吊篮 */}
          <div className="w-1 h-8 bg-gray-600"></div>
          <div className="w-16 h-12 bg-[#8B4513] rounded-sm border-2 border-[#5D2E0C]"></div>
          
          {/* 受力显示 */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-green-600 font-bold text-xs flex flex-col items-center">
            <ArrowUp size={20} />
            浮力 (空中排开重力)
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-red-600 font-bold text-xs flex flex-col items-center">
            自重 + 内部热空气重
            <ArrowDown size={20} />
          </div>
        </motion.div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <label className="font-bold flex items-center gap-2">
            <Thermometer size={18} className="text-orange-500" />
            气囊加热控制 (°C)
          </label>
          <span className="font-mono text-orange-600 text-xl font-bold">{temp.toFixed(0)}°C</span>
        </div>
        <input 
          type="range" min="20" max="150" 
          value={temp} onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full h-4 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-8"
        />
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-500 uppercase font-mono">外界空气密度</span>
              <span className="font-bold">{airDensityCold} kg/m³</span>
            </div>
            <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
              <span className="text-xs text-orange-500 uppercase font-mono tracking-tight">内部空气密度</span>
              <span className="font-bold text-orange-600">{hotAirDensity.toFixed(3)} kg/m³</span>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "加热使气体内气体<strong>体积膨胀</strong>，在压强不变时<strong>密度减小</strong>。当总重力小于受到的浮力时，气球升空。"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. 橡皮泥小船模块 - 验证阿基米德原理
 */
function ClayBoatModule() {
  const [shape, setShape] = useState<'ball' | 'boat'>('ball');
  const [isInWater, setIsInWater] = useState(false);
  
  const mass = 150; // g (保持不变)
  const clayDensity = 2.0; // g/cm³
  const liquidDensity = 1.0; // g/cm³ (水)
  
  // 实心体积
  const solidVolume = mass / clayDensity; // 75 cm³
  // 小船外部排水体积 (当做成船时，排水体积增大)
  const boatVolume = 250; // cm³
  
  const currentVolume = shape === 'ball' ? solidVolume : boatVolume;
  const gravity = (mass * G_CONST) / 1000; // 1.5 N
  
  // 最大可能浮力 (全排开时)
  const maxBuoyancy = (liquidDensity * G_CONST * currentVolume) / 1000;
  
  // 实际浮力
  const buoyancy = isInWater ? (shape === 'ball' ? maxBuoyancy : Math.min(maxBuoyancy, gravity)) : 0;
  
  // 排开水的质量 (g)
  const displacedMass = (buoyancy * 1000) / G_CONST;
  const displacedWeight = buoyancy; // N

  const reset = () => {
    setIsInWater(false);
    setShape('ball');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 实验演示区 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-[#141414]/10 p-8 shadow-2xl h-[500px] relative overflow-hidden group">
            {/* 溢水杯 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-50 border-4 border-gray-200 rounded-b-2xl relative">
              {/* 溢水口 */}
              <div className="absolute -right-8 top-12 w-10 h-4 bg-gray-200 border-2 border-gray-300 rounded-full"></div>
              
              {/* 液体 */}
              <motion.div 
                animate={{ 
                  height: isInWater ? '85%' : '80%',
                  backgroundColor: '#3b82f6'
                }}
                className="absolute bottom-0 left-0 right-0 opacity-30 origin-bottom"
              />

              {/* 橡皮泥物体 */}
              <motion.div
                animate={{ 
                  y: !isInWater 
                    ? -180 
                    : shape === 'ball' 
                      ? 120 
                      : 20,
                  rotate: shape === 'boat' ? [0, -1, 1, 0] : 0
                }}
                transition={{ 
                  type: "spring", 
                  damping: shape === 'boat' ? 10 : 20,
                  rotate: { repeat: Infinity, duration: 4 }
                }}
                className="absolute left-1/2 -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing"
              >
                {shape === 'ball' ? (
                  <div className="w-16 h-16 bg-slate-500 rounded-full border-4 border-slate-600 shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                    实心球
                  </div>
                ) : (
                  <div className="w-40 h-20 bg-slate-500 rounded-b-full border-b-8 border-x-4 border-slate-600 shadow-xl relative">
                    <div className="absolute -top-4 left-4 right-4 h-8 bg-slate-400/50 rounded-full border-2 border-slate-600 flex items-center justify-center text-white text-[10px] font-bold">
                      空心船
                    </div>
                  </div>
                )}

                {/* 受力箭头组件 */}
                {isInWater && (
                  <>
                    <ArrowVector value={gravity} label="G" color="text-red-600" direction="down" />
                    <ArrowVector value={buoyancy} label="F_浮" color="text-green-600" direction="up" />
                  </>
                )}
              </motion.div>
            </div>

            {/* 旁边的接水杯 */}
            <div className="absolute right-12 bottom-1/4 flex flex-col items-center">
              <div className="w-20 h-24 border-2 border-gray-300 rounded-b-lg relative overflow-hidden bg-white">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: isInWater ? `${(displacedMass / 300) * 100}%` : 0 }}
                  className="absolute bottom-0 left-0 right-0 bg-blue-500 opacity-40"
                />
              </div>
              <span className="text-[10px] mt-2 font-mono text-gray-400">接水杯 (排开的水)</span>
            </div>

            {/* 顶部指示 */}
            <div className="absolute top-6 left-8">
              <h3 className="font-black text-xl mb-1">阿基米德原理验证</h3>
              <p className="text-xs text-gray-500 uppercase font-mono">验证: F_浮 = G_排 = ρ_液 g V_排</p>
            </div>
          </div>

          {/* 交互控制 */}
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => { setShape('ball'); setIsInWater(false); }}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${shape === 'ball' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-500"></div>
              <span className="text-sm font-bold">做成实心球</span>
            </button>
            <button 
              onClick={() => { setShape('boat'); setIsInWater(false); }}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${shape === 'boat' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
            >
              <div className="w-12 h-6 rounded-b-full bg-slate-500"></div>
              <span className="text-sm font-bold">捏成空心船</span>
            </button>
            <button 
              onClick={() => setIsInWater(!isInWater)}
              className={`p-4 rounded-3xl font-bold flex flex-col items-center justify-center transition-all ${
                isInWater 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
              }`}
            >
              <Play size={20} className={isInWater ? 'hidden' : 'block mb-1'} />
              <RotateCcw size={20} className={isInWater ? 'block mb-1' : 'hidden'} />
              {isInWater ? '重取物体' : '浸入水中'}
            </button>
          </div>
        </div>

        {/* 侧边对比数据 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Activity size={20} />
              <h4 className="font-bold uppercase tracking-tight">物理量实时比对</h4>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-mono uppercase block mb-2">1. 物体受到的浮力</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-green-600">{buoyancy.toFixed(2)}</span>
                  <span className="text-xs font-bold text-gray-400">N</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-[2px] bg-dashed-gray bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-blue-400 font-mono uppercase block mb-2">2. 排开液体的重力</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-600">{displacedWeight.toFixed(2)}</span>
                  <span className="text-xs font-bold text-blue-400">N</span>
                </div>
                <div className="mt-2 text-[10px] text-blue-600/60 leading-tight">
                  计算: ρ_液 × g × V_排 = {displacedMass.toFixed(0)}g
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isInWater && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-green-600 text-white rounded-2xl shadow-lg"
                >
                  <p className="text-xs font-bold flex items-center gap-2">
                    <Info size={14} />
                    验证成功: F_浮 = G_排
                  </p>
                  <p className="text-[10px] mt-1 opacity-80 leading-relaxed">
                    不论是沉在水底的球，还是漂浮的船，受到的浮力始终等于它排开的水重。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#141414] text-white p-6 rounded-3xl">
            <h4 className="font-bold text-sm mb-3">知识点归纳</h4>
            <ul className="text-[11px] space-y-3 opacity-80 decoration-blue-500">
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0"></span>
                <span>橡皮泥<strong>密度大于水</strong>，实心时重力大于排开水重，故下沉。</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0"></span>
                <span>捏成船后，<strong>排水体积 V_排 增大</strong>，浮力增大。</span>
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0"></span>
                <span>当浮力增大到等于重力时，小船便能漂浮在水面上。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function ArrowVector({ value, label, color, direction }: { value: number, label: string, color: string, direction: 'up' | 'down' }) {
  const isUp = direction === 'up';
  return (
    <div className={`absolute left-1/2 -translate-x-1/2 ${isUp ? 'bottom-1/2' : 'top-1/2'} flex flex-col items-center`}>
      {isUp && (
        <motion.div 
          animate={{ height: value * 60 }}
          className={`w-[3px] ${color.replace('text', 'bg')} flex flex-col items-center relative transition-all`}
        >
          <ArrowUp className={`absolute -top-4 ${color}`} size={16} />
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap ${color} text-[10px] font-bold`}>{label} = {value.toFixed(1)}N</span>
        </motion.div>
      )}
      {!isUp && (
        <motion.div 
          animate={{ height: value * 60 }}
          className={`w-[3px] ${color.replace('text', 'bg')} flex flex-col items-center relative transition-all`}
        >
          <ArrowDown className={`absolute -bottom-4 ${color}`} size={16} />
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap ${color} text-[10px] font-bold`}>{label} = {value.toFixed(1)}N</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * 4. 密度计模型
 */
function HydrometerModule() {
  const [liquidIndex, setLiquidIndex] = useState(0);
  const currentLiquid = LIQUIDS[liquidIndex];
  
  // 浮在液面，F浮 = G
  // 计算浸入深度 (以 px 为单位)
  // 当密度为 1.0 时，lSub 为 100px。
  // 不同的液体密度对应的浸入深度：
  // ρ = 0.8  => lSub = 125px
  // ρ = 1.0  => lSub = 100px
  // ρ = 1.2  => lSub = 83.3px
  const lSub = 100 / currentLiquid.density;
  const stemHeight = 220;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-3xl border border-[#141414]/10 p-12 shadow-2xl h-[500px] relative overflow-hidden flex items-center justify-center">
          
          {/* 玻璃量筒/水槽背景 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-56 border border-gray-200/80 rounded-[40px] bg-gradient-to-b from-slate-50/20 to-slate-100/40 shadow-inner overflow-hidden z-0">
            {/* 液体介质 */}
            <motion.div 
              animate={{ backgroundColor: currentLiquid.color }}
              className="absolute bottom-0 left-0 right-0 h-[60%] opacity-25 origin-bottom"
              transition={{ duration: 0.5 }}
            />
            
            {/* 水平液面虚线指示：固定位置为 top-[40%] （由于量筒高 436px，40% 的位置是 174.4px） */}
            <div className="absolute top-[40%] left-0 right-0 h-[2px] border-t border-dashed border-blue-500 shadow-sm z-10 flex items-center justify-end">
              <span className="text-[9px] font-mono font-bold text-blue-600 bg-white/90 border border-blue-200 px-1.5 py-0.5 rounded-l shadow-sm translate-y-[-50%]">
                液面 Water Line ({currentLiquid.name})
              </span>
            </div>
          </div>

          {/* 密度计 - 顶部通过 css calc 动态计算。
              当 lSub 改变时，密度计会由于机械平衡原理自动上下平稳浮动，
              使得对应的刻度与蓝色的液面指示线完美相交！ */}
          <motion.div 
            animate={{ 
              top: `calc(40% - ${stemHeight - lSub - 10}px)` 
            }}
            transition={{ type: "spring", damping: 18, stiffness: 45 }}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
            style={{ height: `${stemHeight + 80}px` }} 
          >
            {/* 上部细杆 */}
            <div className="w-5 h-[220px] bg-gradient-to-r from-gray-50 via-white to-gray-200 border border-gray-300 rounded-t shadow-inner relative">
              
              {/* 1.2 刻度线 (lSub = 83.3px, stemHeight - lSub = 136.7px) */}
              <div className="absolute inset-x-0 top-[126.7px] flex flex-col items-center">
                <div className="w-full h-[1.5px] bg-indigo-600"></div>
                <span className="text-[8px] font-mono font-black text-indigo-700 scale-90 bg-white/80 px-0.5 rounded leading-none mt-0.5">1.2</span>
              </div>

              {/* 1.0 刻度线 (lSub = 100px, stemHeight - lSub = 120px) */}
              <div className="absolute inset-x-0 top-[110px] flex flex-col items-center">
                <div className="w-full h-[1.5px] bg-green-600"></div>
                <span className="text-[8px] font-mono font-black text-green-700 scale-90 bg-white/80 px-0.5 rounded leading-none mt-0.5">1.0</span>
              </div>

              {/* 0.8 刻度线 (lSub = 125px, stemHeight - lSub = 95px) */}
              <div className="absolute inset-x-0 top-[85px] flex flex-col items-center">
                <div className="w-full h-[1.5px] bg-red-500"></div>
                <span className="text-[8px] font-mono font-black text-red-600 scale-90 bg-white/80 px-0.5 rounded leading-none mt-0.5">0.8</span>
              </div>

              {/* 辅助刻度线 */}
              <div className="absolute inset-0 flex flex-col justify-between py-4 px-1 pointer-events-none opacity-40">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div key={i} className="flex justify-between w-full">
                    <div className="w-1 h-[1px] bg-gray-500" />
                    <div className="w-1 h-[1px] bg-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* 下部玻璃泡与重金属粒子 (铅粒) */}
            <div className="w-12 h-20 bg-gradient-to-b from-gray-100 to-gray-300 rounded-[25%_25%_50%_50%] border-2 border-gray-400 -mt-0.5 shadow-md flex flex-col items-center justify-end pb-3 relative">
              {/* 铅粒配重 */}
              <div className="w-9 h-10 bg-gray-800 rounded-[20%_20%_40%_40%] p-1 flex flex-wrap gap-0.5 items-center justify-center border border-gray-900 shadow-inner">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-black rounded-full" />
                ))}
              </div>
              <span className="text-[6px] font-mono text-gray-500 font-bold tracking-tighter uppercase mt-1">WEIGHTS</span>
            </div>
          </motion.div>

          {/* 实时比对悬浮卡片 */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-gray-150 shadow-lg z-30 w-52">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1">密度计读数 Readout</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600 tracking-tight">{currentLiquid.density.toFixed(2)}</span>
              <span className="text-[10px] text-gray-500 uppercase font-mono">g/cm³</span>
            </div>
            <div className="mt-2 text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 font-sans">
              <div>浸入深度: <strong className="text-indigo-600">{(lSub / 10).toFixed(1)} cm</strong></div>
              <div className="text-gray-400 mt-0.5 text-[9px]">浮力 F_浮 恒等于 重力 G</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-96 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#141414]/10">
          <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">切换液体测试</h3>
          <div className="grid grid-cols-1 gap-3">
            {LIQUIDS.map((l, index) => (
              <button
                key={l.id}
                onClick={() => setLiquidIndex(index)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  liquidIndex === index 
                    ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-100' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{l.name}</span>
                  <span className="text-xs font-mono opacity-50">{l.density} g/cm³</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
          <h4 className="flex items-center gap-2 font-bold mb-2">
            <Droplets size={18} />
            密度计结论
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            密度计始终漂浮，所受浮力始终等于自身重力。
            <br/><br/>
            因为 <strong>F_浮 = ρ_液 g V_排</strong>，所以液体密度 <strong>ρ_液</strong> 越大，排开液体的体积 <strong>V_排</strong> 越小，密度计浸入液体的深度就越浅。
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Common UI Components ---

function DataRow({ label, value, unit, color = "text-[#141414]/80" }: { label: string, value: string | number, unit: string, color?: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-[11px] font-mono uppercase tracking-widest text-[#141414]/40 group-hover:text-[#141414]/60 transition-colors">{label}</span>
      <div className="flex items-baseline gap-1.5 translate-y-[-1px]">
        <span className={`text-sm font-black font-mono ${color}`}>{value}</span>
        <span className="text-[9px] uppercase font-bold text-[#141414]/30">{unit}</span>
      </div>
    </div>
  );
}
