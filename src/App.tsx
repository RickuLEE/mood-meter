import React, { useState, useMemo, useEffect } from 'react';
import { Battery, BatteryLow, Smile, Frown, ChevronRight, Info, MousePointer2, Trash2, Calendar, RotateCcw } from 'lucide-react';

interface RecordItem {
  id: number;
  date: string;
  comfort: number;
  energy: number;
  quadrant: string;
  quadrantColor: string;
}

interface QuadrantInfo {
  name: string;
  color: string;
  description: string;
  body: string;
  vocab: string[];
}

const MoodMeterApp: React.FC = () => {
  const [step, setStep] = useState<number>(0); // 0: Intro, 1: Comfort, 2: Energy, 3: Result
  const [comfort, setComfort] = useState<number>(5);
  const [energy, setEnergy] = useState<number>(5);
  const [showVocab, setShowVocab] = useState<boolean>(false);
  
  // 歷史紀錄狀態
  const [history, setHistory] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem('mood_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mood_history', JSON.stringify(history));
  }, [history]);

  // 低飽和度暖色調
  const colors = {
    bg: '#FFFDF3',
    line: '#4E2A15',
    red: '#FCD7D4',
    yellow: '#FBF0CE',
    blue: '#D3DBE2',
    green: '#B7CDBB',
  };

  const quadrantInfo = useMemo<QuadrantInfo>(() => {
    const isHighComfort = comfort > 5;
    const isHighEnergy = energy > 5;

    if (!isHighComfort && isHighEnergy) return { name: '紅色象限', color: colors.red, description: '低舒適度 ＋ 高動能值', body: '此區域通常伴隨肌肉緊繃、心跳加快、呼吸較淺或內心有推擠感。這是一股正在體內尋找出口的活躍能量。', vocab: ['焦慮', '憤怒', '挫折', '被冒犯', '驚慌'] };
    if (isHighComfort && isHighEnergy) return { name: '黃色象限', color: colors.yellow, description: '高舒適度 ＋ 高動能值', body: '此區域代表身心充滿正面動力，感受到連結感與向前的推動力，是極具創造力與分享欲的狀態。', vocab: ['驚喜', '興奮', '期待', '自信', '愉快'] };
    if (!isHighComfort && !isHighEnergy) return { name: '藍色象限', color: colors.blue, description: '低舒適度 ＋ 低動能值', body: '此區域感覺像能量被「凍結」或抽離，可能會想縮回自己的世界，體感較冷、沉重或動作緩慢。', vocab: ['失望', '委屈', '悲傷', '無力感', '孤單'] };
    return { name: '綠色象限', color: colors.green, description: '高舒適度 ＋ 低動能值', body: '此區域是身心的修復期，感覺平穩、紮實且安全。這是一個適合觀察、思考與休息的緩衝區。', vocab: ['放鬆', '平靜', '滿足', '安詳', '安全感'] };
  }, [comfort, energy, colors.red, colors.yellow, colors.blue, colors.green]);

  const saveRecord = () => {
    const newRecord: RecordItem = {
      id: Date.now(),
      date: new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      comfort,
      energy,
      quadrant: quadrantInfo.name,
      quadrantColor: quadrantInfo.color
    };
    setHistory(prev => [newRecord, ...prev].slice(0, 30));
    reset();
  };

  const deleteRecord = (id: number) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearAllHistory = () => {
    if (window.confirm('確定要清除所有歷史觀測紀錄嗎？')) {
      setHistory([]);
    }
  };

  const reset = () => {
    setStep(0);
    setComfort(5);
    setEnergy(5);
    setShowVocab(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 10; y >= 1; y--) {
      for (let x = 1; x <= 10; x++) {
        const isCurrent = x === comfort && y === energy;
        const qColor = (x <= 5 && y > 5) ? colors.red : 
                       (x > 5 && y > 5) ? colors.yellow : 
                       (x <= 5 && y <= 5) ? colors.blue : colors.green;
        
        const isTargetQuadrant = (comfort <= 5 && energy > 5 && x <= 5 && y > 5) ||
                                 (comfort > 5 && energy > 5 && x > 5 && y > 5) ||
                                 (comfort <= 5 && energy <= 5 && x <= 5 && y <= 5) ||
                                 (comfort > 5 && energy <= 5 && x > 5 && y <= 5);

        cells.push(
          <div 
            key={`${x}-${y}`} 
            className="relative border-[0.5px] transition-opacity duration-300"
            style={{ 
              backgroundColor: qColor,
              opacity: isTargetQuadrant ? 1 : 0.25,
              borderColor: `${colors.line}15`
            }}
          >
            {isCurrent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-4 h-4 rounded-full opacity-75 animate-ping absolute"
                  style={{ backgroundColor: colors.line }}
                />
                <div 
                  className="w-3 h-3 rounded-full shadow-md z-10 border border-white/60"
                  style={{ backgroundColor: colors.line }}
                />
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 font-sans pb-20 select-none" style={{ backgroundColor: colors.bg, color: colors.line }}>
      
      {/* 頂部標題 */}
      <header className="mb-6 mt-6 text-center">
        <h1 className="text-2xl font-bold mb-1.5 tracking-tight">情緒觀察儀表板</h1>
        <p className="text-xs opacity-60 tracking-wider">成為自己情緒的觀察科學家</p>
      </header>

      <main className="w-full max-w-md bg-white/60 backdrop-blur-md rounded-[32px] p-6 shadow-xl border border-white/60 relative overflow-hidden mb-6 transition-all duration-300">
        
        {/* Step 0: Intro */}
        {step === 0 && (
          <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="mb-5 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100/80 shadow-inner flex items-center justify-center">
                <MousePointer2 className="w-8 h-8" style={{ color: colors.line }} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-3">歡迎參與觀察</h2>
            <p className="mb-7 text-xs leading-relaxed opacity-75 px-2">
              這是一個客觀的測量工具。我們不評價感受的好壞，只單純地標記訊號的「位置」。
            </p>
            <button 
              onClick={() => setStep(1)}
              style={{ backgroundColor: colors.line }}
              className="w-full py-3.5 text-white rounded-2xl font-bold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md text-sm"
            >
              開始觀測 <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 1: Comfort */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="mb-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">Step 01 / 02</div>
            <h2 className="text-sm font-bold mb-8 leading-relaxed">
              純粹留意你的呼吸與體感，如果此時此刻的「舒適放鬆度」是一個數字，它會落在哪裡？
            </h2>
            
            <div className="flex items-center gap-4 mb-8">
              <Frown style={{ color: colors.line }} className="opacity-40 shrink-0" size={24} />
              <input 
                type="range" min="1" max="10" step="1"
                value={comfort}
                onChange={(e) => setComfort(parseInt(e.target.value))}
                style={{ accentColor: colors.line }}
                className="flex-1 h-2.5 bg-gray-200/80 rounded-full appearance-none cursor-pointer"
              />
              <Smile style={{ color: colors.line }} className="opacity-40 shrink-0" size={24} />
            </div>

            <div className="flex justify-between text-xs font-bold opacity-50 px-1 mb-8 items-center">
              <span className="text-[11px]">1 體感高度不適</span>
              <span className="text-2xl opacity-100 font-black" style={{ color: colors.line }}>{comfort}</span>
              <span className="text-[11px]">10 體感高度舒適</span>
            </div>

            <button 
              onClick={() => setStep(2)}
              style={{ backgroundColor: colors.line }}
              className="w-full py-3.5 text-white rounded-2xl font-bold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md text-sm"
            >
              下一步 <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Energy */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300 flex flex-col h-full">
            <div className="mb-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">Step 02 / 02</div>
            <h2 className="text-sm font-bold mb-6 leading-relaxed">
              感覺一下體內的能量。這股能量此時是靜止沉澱的，還是正在高速運作、甚至有些緊繃？
            </h2>
            
            <div className="flex items-center justify-center gap-8 mb-6 h-56">
              <div className="flex flex-col items-center justify-between h-full py-1">
                <Battery style={{ color: colors.line }} className="opacity-40 shrink-0" size={22} />
                <div className="w-[2px] flex-1 my-2 bg-gray-200/80" />
                <BatteryLow style={{ color: colors.line }} className="opacity-40 shrink-0" size={22} />
              </div>

              <div className="relative h-full flex items-center justify-center w-12 touch-none">
                <input 
                  type="range" min="1" max="10" step="1"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  style={{ 
                      transform: 'rotate(-90deg)', 
                      width: '180px',
                      accentColor: colors.line,
                      cursor: 'pointer'
                  }}
                  className="h-2.5 bg-gray-200/80 rounded-full appearance-none absolute"
                />
              </div>

              <div className="flex flex-col items-center justify-center min-w-[70px]">
                 <span className="text-[10px] opacity-50 font-bold mb-1 uppercase tracking-wider">能量值</span>
                 <span className="text-3xl font-black" style={{ color: colors.line }}>{energy}</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-bold opacity-40 mb-6 px-2">
              <span>10 極高動能 / 緊繃</span>
              <span>1 動能極低 / 靜止</span>
            </div>

            <button 
              onClick={() => setStep(3)}
              style={{ backgroundColor: colors.line }}
              className="w-full py-3.5 text-white rounded-2xl font-bold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md text-sm"
            >
              完成觀測 <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-300">
            <div className="text-center mb-4">
              <h2 className="text-xs font-bold opacity-40 mb-1 tracking-wider uppercase">🔬 觀測數據已定位</h2>
              <div className="text-xs font-medium space-x-4">
                <span>舒適度: <b>{comfort}</b></span>
                <span>動能感: <b>{energy}</b></span>
              </div>
            </div>

            {/* 網格與座標軸 */}
            <div className="relative mb-8 p-1.5 rounded-2xl" style={{ backgroundColor: `${colors.line}08` }}>
              <div className="grid grid-cols-10 grid-rows-10 gap-[1px] aspect-square w-full rounded-xl overflow-hidden border" style={{ borderColor: `${colors.line}22` }}>
                {renderGrid()}
              </div>
              <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold opacity-30 uppercase tracking-widest pointer-events-none">
                動能 (Energy)
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-30 uppercase tracking-widest pointer-events-none">
                舒適度 (Comfort)
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border mb-4 text-center" style={{ borderColor: `${colors.line}11` }}>
              <div className="text-[11px] opacity-50 mb-1.5 font-bold">請在心中對自己默讀這句話：</div>
              <div className="text-xs font-black tracking-wider py-1.5 px-4 rounded-lg inline-block shadow-xs" style={{ backgroundColor: quadrantInfo.color }}>
                「我現在處在 {quadrantInfo.name}。」
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl text-xs leading-relaxed border-l-4 opacity-85" style={{ backgroundColor: `${colors.line}06`, borderColor: quadrantInfo.color }}>
                {quadrantInfo.body}
              </div>

              {!showVocab ? (
                <button 
                  onClick={() => setShowVocab(true)}
                  style={{ borderColor: `${colors.line}22`, color: colors.line }}
                  className="w-full py-2.5 border rounded-xl text-xs font-bold hover:bg-black/5 transition-colors flex items-center justify-center gap-1.5 opacity-80"
                >
                  <Info size={14} /> 查看此空間的常見訊號詞
                </button>
              ) : (
                <div className="flex flex-wrap gap-1.5 justify-center py-1 animate-in fade-in zoom-in-95">
                  {quadrantInfo.vocab.map(v => (
                    <span key={v} className="px-2.5 py-1 bg-white border rounded-full text-[11px] font-bold shadow-xs opacity-75" style={{ borderColor: `${colors.line}15` }}>
                      {v}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={reset}
                  style={{ borderColor: `${colors.line}33`, color: colors.line }}
                  className="py-3 px-4 border rounded-2xl font-bold hover:bg-black/5 active:scale-[0.98] transition-all flex items-center justify-center"
                  title="重新測量"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={saveRecord}
                  style={{ backgroundColor: colors.line }}
                  className="flex-1 py-3.5 text-white rounded-2xl font-bold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md text-xs"
                >
                  儲存觀測紀錄並結束
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 歷史紀錄區塊 */}
      {step === 0 && (
        <section className="w-full max-w-md bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/50 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5 opacity-75 uppercase tracking-wider">
              <Calendar size={14} /> 歷史觀測日誌 ({history.length})
            </h3>
            {history.length > 0 && (
              <button onClick={clearAllHistory} className="text-[11px] font-medium text-red-600/70 hover:text-red-600 flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> 清除全部
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-7 text-xs opacity-40 italic">
              尚無紀錄，開始你的第一次情緒觀測吧！
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {history.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2.5 bg-white/70 rounded-xl border text-xs transition-all hover:bg-white/90" style={{ borderColor: `${colors.line}11` }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs shrink-0" style={{ backgroundColor: item.quadrantColor }} />
                    <div>
                      <div className="font-bold text-[11px]">{item.quadrant}</div>
                      <div className="text-[9px] opacity-40">{item.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="text-right opacity-70 font-medium text-[11px]">
                      舒適 <span className="font-bold">{item.comfort}</span> | 動能 <span className="font-bold">{item.energy}</span>
                    </div>
                    <button onClick={() => deleteRecord(item.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="mt-8 text-[9px] opacity-30 font-bold uppercase tracking-[0.2em]">
        Emotion Scientist Mode Activated
      </footer>
    </div>
  );
};

export default MoodMeterApp;