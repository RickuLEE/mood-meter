import React, { useState, useMemo, useEffect } from 'react';
import { Battery, BatteryLow, Smile, Frown, ChevronRight, RotateCcw, Info, MousePointer2, Trash2, Calendar } from 'lucide-react';

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
  
  // 歷史紀錄狀態（初始化時從手機/瀏覽器本地讀取）
  const [history, setHistory] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem('mood_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 當紀錄更新時，同步寫入本地儲存
  useEffect(() => {
    localStorage.setItem('mood_history', JSON.stringify(history));
  }, [history]);

  // 顏色規範
  const colors = {
    bg: '#FFFDF3',
    line: '#4E2A15',
    red: '#FCD7D4',
    yellow: '#FBF0CE',
    blue: '#D3DBE2',
    green: '#B7CDBB',
  };

  // 判斷象限
  const quadrantInfo = useMemo<QuadrantInfo>(() => {
    const isHighComfort = comfort > 5;
    const isHighEnergy = energy > 5;

    if (!isHighComfort && isHighEnergy) return { name: '紅色象限', color: colors.red, description: '低舒適度 ＋ 高動能值', body: '此區域通常伴隨肌肉緊繃、心跳加快、呼吸較淺或內心有推擠感。這是一股正在體內尋找出口的活躍能量。', vocab: ['焦慮', '憤怒', '挫折', '被冒犯', '驚慌'] };
    if (isHighComfort && isHighEnergy) return { name: '黃色象限', color: colors.yellow, description: '高舒適度 ＋ 高動能值', body: '此區域代表身心充滿正面動力，感受到連結感與向前的推動力，是極具創造力與分享欲的狀態。', vocab: ['驚喜', '興奮', '期待', '自信', '愉快'] };
    if (!isHighComfort && !isHighEnergy) return { name: '藍色象限', color: colors.blue, description: '低舒適度 ＋ 低動能值', body: '此區域感覺像能量被「凍結」或抽離，可能會想縮回自己的世界，體感較冷、沉重或動作緩慢。', vocab: ['失望', '委屈', '悲傷', '無力感', '孤單'] };
    return { name: '綠色象限', color: colors.green, description: '高舒適度 ＋ 低動能值', body: '此區域是身心的修復期，感覺平穩、紮實且安全。這是一個適合觀察、思考與休息的緩衝區。', vocab: ['放鬆', '平靜', '滿足', '安詳', '安全感'] };
  }, [comfort, energy, colors.red, colors.yellow, colors.blue, colors.green]);

  // 儲存紀錄
  const saveRecord = () => {
    const newRecord: RecordItem = {
      id: Date.now(),
      date: new Date().toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      comfort,
      energy,
      quadrant: quadrantInfo.name,
      quadrantColor: quadrantInfo.color
    };
    // 最多保留 30 筆最新紀錄
    setHistory(prev => [newRecord, ...prev].slice(0, 30));
    reset();
  };

  // 刪除單筆紀錄
  const deleteRecord = (id: number) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // 清除全部紀錄
  const clearAllHistory = () => {
    if (window.confirm('確定要清除所有歷史觀測紀錄嗎？')) {
      setHistory([]);
    }
  };

  // 重置
  const reset = () => {
    setStep(0);
    setComfort(5);
    setEnergy(5);
    setShowVocab(false);
  };

  // 繪製 10x10 網格
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
            className="relative border-[0.5px]"
            style={{ 
              backgroundColor: qColor,
              opacity: isTargetQuadrant ? 1 : 0.2,
              borderColor: `${colors.line}22`
            }}
          >
            {isCurrent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-3 h-3 rounded-full shadow-lg animate-ping absolute"
                  style={{ backgroundColor: colors.line }}
                />
                <div 
                  className="w-3 h-3 rounded-full shadow-lg z-10"
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
    <div className="min-h-screen flex flex-col items-center justify-start p-4 font-sans pb-20" style={{ backgroundColor: colors.bg, color: colors.line }}>
      
      {/* 頂部標題 */}
      <header className="mb-6 mt-6 text-center">
        <h1 className="text-2xl font-bold mb-2 tracking-tight">情緒觀察儀表板</h1>
        <p className="text-sm opacity-60">成為自己情緒的觀察科學家</p>
      </header>

      <main className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-[32px] p-6 shadow-xl border border-white/50 relative overflow-hidden mb-6">
        
        {/* Step 0: Intro */}
        {step === 0 && (
          <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <MousePointer2 className="w-8 h-8" style={{ color: colors.line }} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-3">歡迎參與觀察</h2>
            <p className="mb-6 text-sm leading-relaxed opacity-80">
              這是一個客觀的測量工具。我們不評價感受的好壞，只單純地標記訊號的「位置」。
            </p>
            <button 
              onClick={() => setStep(1)}
              style={{ backgroundColor: colors.line }}
              className="w-full py-4 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              開始觀測 <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 1: Comfort */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="mb-2 text-xs font-bold opacity-40 uppercase tracking-widest">Step 01 / 02</div>
            <h2 className="text-base font-bold mb-6 leading-snug">
              純粹留意你的呼吸與體感，如果此時此刻的「舒適放鬆度」是一個數字，它會落在哪裡？
            </h2>
            
            <div className="flex items-center gap-4 mb-8">
              <Frown style={{ color: colors.line }} className="opacity-40" size={24} />
              <input 
                type="range" min="1" max="10" step="1"
                value={comfort}
                onChange={(e) => setComfort(parseInt(e.target.value))}
                style={{ accentColor: colors.line }}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none"
              />
              <Smile style={{ color: colors.line }} className="opacity-40" size={24} />
            </div>

            <div className="flex justify-between text-xs font-bold opacity-50 px-1 mb-8">
              <span>1 體感高度不適</span>
              <span className="text-xl opacity-100 font-black" style={{ color: colors.line }}>{comfort}</span>
              <span>10 體感高度舒適</span>
            </div>

            <button 
              onClick={() => setStep(2)}
              style={{ backgroundColor: colors.line }}
              className="w-full py-4 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              下一步 <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Energy */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
            <div className="mb-2 text-xs font-bold opacity-40 uppercase tracking-widest">Step 02 / 02</div>
            <h2 className="text-base font-bold mb-4 leading-snug">
              感覺一下體內的能量。這股能量此時是靜止沉澱的，還是正在高速運作、甚至有些緊繃？
            </h2>
            
            <div className="flex items-center justify-center gap-8 mb-6 h-60">
              <div className="flex flex-col items-center justify-between h-full py-2">
                <Battery style={{ color: colors.line }} className="opacity-40" size={24} />
                <div className="h-32 w-[2px] bg-gray-100 relative" />
                <BatteryLow style={{ color: colors.line }} className="opacity-40" size={24} />
              </div>

              <div className="relative h-full flex items-center justify-center w-12">
                <input 
                  type="range" min="1" max="10" step="1"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  style={{ 
                      transform: 'rotate(-90deg)', 
                      width: '200px',
                      accentColor: colors.line,
                      cursor: 'pointer'
                  }}
                  className="h-2 bg-gray-200 rounded-full appearance-none absolute"
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                 <span className="text-xs opacity-50 font-bold mb-1">能量值</span>
                 <span className="text-3xl font-black" style={{ color: colors.line }}>{energy}</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] font-bold opacity-40 mb-6 px-4">
              <span>10 為極高動能 / 緊繃</span>
              <span>1 為動能極低 / 靜止</span>
            </div>

            <button 
              onClick={() => setStep(3)}
              style={{ backgroundColor: colors.line }}
              className="w-full py-4 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              完成觀測 <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-500">
            <div className="text-center mb-4">
              <h2 className="text-sm font-bold opacity-40 mb-1 italic">🔬 觀測數據已定位</h2>
              <div className="text-xs font-medium space-x-4">
                <span>舒適度: <b>{comfort}</b></span>
                <span>動能感: <b>{energy}</b></span>
              </div>
            </div>

            <div className="relative mb-6 p-1 rounded-2xl" style={{ backgroundColor: `${colors.line}08` }}>
              <div className="grid grid-cols-10 grid-rows-10 gap-[1px] aspect-square w-full rounded-xl overflow-hidden border" style={{ borderColor: `${colors.line}33` }}>
                {renderGrid()}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-inner border mb-4 text-center" style={{ borderColor: `${colors.line}11` }}>
              <div className="text-xs opacity-50 mb-1 font-bold">請在心中對自己默讀這句話：</div>
              <div className="text-sm font-black tracking-wider py-1.5 px-4 rounded-lg inline-block shadow-sm" style={{ backgroundColor: quadrantInfo.color }}>
                「我現在處在 {quadrantInfo.name}。」
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl text-xs leading-relaxed border-l-4 italic opacity-80" style={{ backgroundColor: `${colors.line}08`, borderColor: `${colors.line}33` }}>
                {quadrantInfo.body}
              </div>

              {!showVocab ? (
                <button 
                  onClick={() => setShowVocab(true)}
                  style={{ borderColor: `${colors.line}33`, color: `${colors.line}99` }}
                  className="w-full py-2.5 border-2 rounded-xl text-xs font-bold hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Info size={14} /> 查看此空間的常見訊號詞
                </button>
              ) : (
                <div className="flex flex-wrap gap-1.5 justify-center py-1 animate-in fade-in zoom-in-95">
                  {quadrantInfo.vocab.map(v => (
                    <span key={v} className="px-2.5 py-0.5 bg-white border rounded-full text-xs font-bold opacity-70" style={{ borderColor: `${colors.line}22` }}>
                      {v}
                    </span>
                  ))}
                </div>
              )}

              <button 
                onClick={saveRecord}
                style={{ backgroundColor: colors.line }}
                className="w-full py-4 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                儲存觀測紀錄並結束
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 歷史紀錄區塊 */}
      {step === 0 && (
        <section className="w-full max-w-md bg-white/30 backdrop-blur-sm rounded-[24px] p-5 border border-white/40 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2 opacity-80">
              <Calendar size={16} /> 歷史觀測日誌 ({history.length})
            </h3>
            {history.length > 0 && (
              <button onClick={clearAllHistory} className="text-xs font-medium text-red-600/70 hover:text-red-600 flex items-center gap-1">
                <Trash2 size={12} /> 清除全部
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-xs opacity-40 italic">
              尚無紀錄，開始你的第一次情緒觀測吧！
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white/70 rounded-xl border text-xs transition-all hover:bg-white" style={{ borderColor: `${colors.line}11` }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: item.quadrantColor }} />
                    <div>
                      <div className="font-bold">{item.quadrant}</div>
                      <div className="text-[10px] opacity-40">{item.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right opacity-70 font-medium">
                      舒適 <span className="font-bold">{item.comfort}</span> | 動能 <span className="font-bold">{item.energy}</span>
                    </div>
                    <button onClick={() => deleteRecord(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="mt-8 text-[10px] opacity-30 font-bold uppercase tracking-[0.2em]">
        Emotion Scientist Mode Activated
      </footer>
    </div>
  );
};

export default MoodMeterApp;