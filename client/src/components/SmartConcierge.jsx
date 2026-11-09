import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatVND } from '../utils/format';

export default function SmartConcierge({ tours = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý Cảm Xúc & Du Lịch SoulTrip — “Travel Where Your Soul Leads”. Hôm nay bạn đang cảm thấy thế nào và muốn trải nghiệm điều gì? (Ví dụ: "tôi cần một nơi yên tĩnh để chữa lành", "chuyến đi lãng mạn cùng người yêu", hay "tour mạo hiểm bứt phá").',
      recommendations: []
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    '🌿 Cần nơi bình yên để chữa lành',
    '⚡ Muốn bứt phá, phiêu lưu',
    '🌅 Kỳ nghỉ lãng mạn người thương',
    '🌊 Chuyến đi tự do phóng khoáng',
    'Tour biển đảo dưới 4 triệu'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Bộ máy phân tích ngữ nghĩa tự nhiên nhẹ (Smart Natural Matching & Emotional Mapping)
  const processUserQuery = (query) => {
    const q = query.toLowerCase();
    let matches = [...tours];
    let customBotReply = '';

    // Gợi ý theo sở thích du lịch
    if (q.includes('chữa lành') || q.includes('bình yên') || q.includes('tĩnh tại') || q.includes('mệt mỏi') || q.includes('yên tĩnh')) {
      matches = matches.filter((t) => t.mood_id === 'healing');
      customBotReply = '🌿 Tôi hiểu bạn đang cần một khoảng lặng để nạp lại năng lượng. Dưới đây là những hành trình bình yên giữa đại ngàn và non nước để xoa dịu tâm hồn:';
    } else if (q.includes('bứt phá') || q.includes('phiêu lưu') || q.includes('mạo hiểm') || q.includes('thử thách') || q.includes('chinh phục')) {
      matches = matches.filter((t) => t.mood_id === 'adventure');
      customBotReply = '⚡ Tuyệt vời! Để bứt phá giới hạn bản thân, hãy thử thách mình với những cung đường đèo hiểm trở và sa mạc cát rực lửa này:';
    } else if (q.includes('lãng mạn') || q.includes('người yêu') || q.includes('cặp đôi') || q.includes('hoàng hôn') || q.includes('người thương')) {
      matches = matches.filter((t) => t.mood_id === 'romance');
      customBotReply = '🌅 Một kỳ nghỉ lưu giữ khoảnh khắc ngọt ngào bên người thương! Dưới đây là những hành trình hoàng hôn biển ngọc và phố cổ thơ mộng nhất:';
    } else if (q.includes('tự do') || q.includes('khám phá') || q.includes('phóng khoáng') || q.includes('ba lô')) {
      matches = matches.filter((t) => t.mood_id === 'discovery');
      customBotReply = '🌊 Thế giới bao la đang vẫy gọi! Dưới đây là những hành trình tự do phóng khoáng ngập tràn nắng biển và nét đẹp sông nước phương Nam:';
    }

    // Lọc theo vùng miền hoặc địa danh
    if (q.includes('bắc') || q.includes('hà giang') || q.includes('sapa') || q.includes('fansipan') || q.includes('lào cai') || q.includes('hạ long') || q.includes('ninh bình') || q.includes('điện biên') || q.includes('bản giốc') || q.includes('cao bằng')) {
      matches = matches.filter((t) => t.region === 'Bắc');
    } else if (q.includes('trung') || q.includes('đà nẵng') || q.includes('hội an') || q.includes('huế') || q.includes('đà lạt') || q.includes('quy nhơn') || q.includes('phú yên') || q.includes('quảng bình') || q.includes('phong nha') || q.includes('nha trang')) {
      matches = matches.filter((t) => t.region === 'Trung');
    } else if (q.includes('nam') || q.includes('phú quốc') || q.includes('miền tây') || q.includes('cần thơ') || q.includes('mũi né') || q.includes('phan thiết') || q.includes('côn đảo')) {
      matches = matches.filter((t) => t.region === 'Nam');
    }

    // Lọc theo đặc trưng trải nghiệm
    if (q.includes('biển') || q.includes('đảo')) {
      matches = matches.filter(
        (t) =>
          t.category_name.toLowerCase().includes('biển') ||
          t.title.toLowerCase().includes('biển') ||
          t.title.toLowerCase().includes('phú quốc')
      );
    } else if (q.includes('núi') || q.includes('mạo hiểm') || q.includes('săn mây')) {
      matches = matches.filter(
        (t) =>
          t.category_name.toLowerCase().includes('núi') ||
          t.category_name.toLowerCase().includes('mạo hiểm') ||
          t.itinerary_summary.toLowerCase().includes('mây')
      );
    } else if (q.includes('sinh thái') || q.includes('sông nước')) {
      matches = matches.filter((t) => t.category_name.toLowerCase().includes('sinh thái'));
    }

    // Lọc theo phương tiện di chuyển (Vé máy bay / Xe Limousine)
    if (q.includes('máy bay') || q.includes('bay')) {
      const flightMatches = matches.filter((t) => t.transport_type === 'FLIGHT');
      if (flightMatches.length > 0) matches = flightMatches;
    } else if (q.includes('limousine') || q.includes('xe giường nằm') || q.includes('cabin')) {
      const limoMatches = matches.filter((t) => t.transport_type === 'LIMOUSINE');
      if (limoMatches.length > 0) matches = limoMatches;
    }

    // Lọc theo điểm khởi hành
    if (q.includes('hà nội') && (q.includes('khởi hành') || q.includes('từ'))) {
      const hnMatches = matches.filter((t) => t.departure_location && t.departure_location.includes('Hà Nội'));
      if (hnMatches.length > 0) matches = hnMatches;
    } else if ((q.includes('sài gòn') || q.includes('tphcm') || q.includes('hồ chí minh')) && (q.includes('khởi hành') || q.includes('từ'))) {
      const sgMatches = matches.filter((t) => t.departure_location && t.departure_location.includes('Hồ Chí Minh'));
      if (sgMatches.length > 0) matches = sgMatches;
    }

    // Lọc theo ngân sách
    if (q.includes('dưới 2 triệu') || q.includes('< 2 triệu') || q.includes('2tr')) {
      matches = matches.filter((t) => t.base_price <= 2000000);
    } else if (q.includes('dưới 3 triệu') || q.includes('< 3 triệu') || q.includes('3tr')) {
      matches = matches.filter((t) => t.base_price <= 3000000);
    } else if (q.includes('dưới 4 triệu') || q.includes('< 4 triệu') || q.includes('4tr')) {
      matches = matches.filter((t) => t.base_price <= 4000000);
    } else if (q.includes('dưới 5 triệu') || q.includes('< 5 triệu') || q.includes('5tr')) {
      matches = matches.filter((t) => t.base_price <= 5000000);
    }

    // Lọc theo thời gian số ngày
    if (q.includes('2 ngày') || q.includes('2n')) {
      matches = matches.filter((t) => t.duration_days === 2);
    } else if (q.includes('3 ngày') || q.includes('3n')) {
      matches = matches.filter((t) => t.duration_days === 3);
    } else if (q.includes('4 ngày') || q.includes('4n')) {
      matches = matches.filter((t) => t.duration_days === 4);
    }

    return { matches: matches.slice(0, 2), customBotReply };
  };

  const handleSendQuery = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text, recommendations: [] }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      const { matches: results, customBotReply } = processUserQuery(text);
      let botReply = '';

      if (customBotReply && results.length > 0) {
        botReply = customBotReply;
      } else if (results.length > 0) {
        botReply = `Tôi đã lắng nghe và tìm thấy ${results.length} hành trình trải nghiệm phù hợp nhất với mong muốn của bạn:`;
      } else {
        botReply = `Chưa có tour trùng khớp 100% với yêu cầu này, nhưng đây là những gợi ý hành trình đang được yêu thích nhất:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          recommendations: results.length > 0 ? results : tours.slice(0, 2)
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendQuery(inputMsg);
    setInputMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút bấm mở Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white rounded-full shadow-2xl hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Mở Trợ lý AI"
        >
          <Sparkles className="w-5 h-5 text-amber-200 group-hover:animate-pulse" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">Travel by Mood AI</span>
        </button>
      )}

      {/* Cửa sổ Chat Concierge */}
      {isOpen && (
        <div className="w-[340px] sm:w-[400px] h-[530px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Bot className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <span>SoulTrip AI</span>
                  <span className="text-[10px] font-normal opacity-90">• Travel Where Your Soul Leads</span>
                </h3>
                <span className="text-[10px] text-amber-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Lắng nghe cảm xúc 24/7
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950 text-xs">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[82%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-sky-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Hiển thị thẻ tour gợi ý */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {m.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-sm hover:border-sky-300 dark:hover:border-sky-500 transition flex gap-2.5 items-center"
                        >
                          <img
                            src={rec.featured_image}
                            alt={rec.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white truncate text-[11px]">{rec.title}</h4>
                            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold">{formatVND(rec.base_price)}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400">
                              {rec.duration_days} ngày • Miền {rec.region}
                            </span>
                          </div>
                          <Link
                            to={`/tours/${rec.id}`}
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 bg-sky-50 dark:bg-slate-700 text-sky-600 dark:text-sky-300 hover:bg-sky-600 hover:text-white rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 dark:text-slate-500 text-xs italic">
                <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <span>Trợ lý đang suy nghĩ và tìm tour phù hợp...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts gợi ý */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuery(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-300 text-slate-600 dark:text-slate-300 text-[10px] font-medium transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Chat */}
          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập yêu cầu tour (vùng miền, giá, số ngày)..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
