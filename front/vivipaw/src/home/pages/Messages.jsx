import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LuSearch,
  LuSend,
  LuMessageCircle,
  LuInbox,
  LuUser,
  LuStethoscope,
  LuPawPrint,
  LuPackage,
  LuShoppingBag,
  LuLifeBuoy,
  LuCheckCheck,
  LuWifi,
  LuWifiOff,
  LuTrash2,
  LuImage,
  LuSmile,
  LuX,
  LuArrowLeft,
} from 'react-icons/lu';
import { uploadApi } from '../../services/endpoints';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../../utils/helpers';

const CHAT_TYPE = {
  Direct: 1,
  PetAdoption: 2,
  Product: 3,
  Order: 4,
  Appointment: 5,
  Support: 6,
};

const STICKERS = ['😀', '😂', '😍', '🥰', '😎', '😢', '🙏', '👍', '❤️', '🐾', '🎉', '🔥'];

const typeIcon = (type, typeText) => {
  const t = String(typeText || type || '').toLowerCase();
  if (Number(type) === CHAT_TYPE.PetAdoption || t.includes('pet')) return LuPawPrint;
  if (Number(type) === CHAT_TYPE.Product || t.includes('product')) return LuPackage;
  if (Number(type) === CHAT_TYPE.Order || t.includes('order')) return LuShoppingBag;
  if (Number(type) === CHAT_TYPE.Appointment || t.includes('appointment')) return LuStethoscope;
  if (Number(type) === CHAT_TYPE.Support || t.includes('support')) return LuLifeBuoy;
  return LuMessageCircle;
};

const typeLabel = (type, typeText) => {
  const n = Number(type);
  if (n === CHAT_TYPE.Direct) return 'Şəxsi söhbət';
  if (n === CHAT_TYPE.PetAdoption) return 'Heyvan elanı';
  if (n === CHAT_TYPE.Product) return 'Məhsul';
  if (n === CHAT_TYPE.Order) return 'Sifariş';
  if (n === CHAT_TYPE.Appointment) return 'Randevu';
  if (n === CHAT_TYPE.Support) return 'Dəstək';
  return typeText || 'Söhbət';
};

const initials = (name) => {
  const s = String(name || '?').trim();
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return s.slice(0, 2).toUpperCase();
};

const Avatar = ({ name, src, size = 'w-11 h-11' }) => {
  if (src) {
    return (
      <img src={src} alt={name || ''} className={`${size} rounded-2xl object-cover border border-slate-200 shrink-0`} />
    );
  }
  return (
    <div className={`${size} rounded-2xl bg-sky-50 text-sky-600 grid place-items-center border border-sky-100 font-black text-xs shrink-0`}>
      {initials(name)}
    </div>
  );
};

const isImage = (m) => {
  const type = String(m.attachmentType || '').toLowerCase();
  const url = String(m.attachmentUrl || '').toLowerCase();
  return type.includes('image') || /\.(png|jpg|jpeg|webp|gif)$/i.test(url);
};

const ConfirmModal = ({ open, title, text, dangerText = 'Bəli, sil', onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center" onMouseDown={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">{text}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition">İmtina</button>
          <button onClick={onConfirm} className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition">
            <LuTrash2 size={14} />{dangerText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const { user } = useAuth();

  const {
    connected,
    conversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    loadingConversations,
    loadingMessages,
    openConversation,
    startChat,
    sendMessage,
    deleteConversation,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useChat();

  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stickersOpen, setStickersOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmDeleteConv, setConfirmDeleteConv] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2400); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const hay = [c.title, c.targetFullName, c.targetEmail, c.lastMessage, c.typeText].filter(Boolean).join(' ').toLowerCase();
      return !q || hay.includes(q);
    });
  }, [conversations, search]);

  const handleOpenConversation = (id) => {
    openConversation(id);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }
  }, [activeMessages, activeConversationId]);

  const submit = async (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || !activeConversationId || sending) return;
    setSending(true);
    const res = await sendMessage(activeConversationId, { message: msg });
    if (res?.success) setText('');
    else showToast(res?.message || 'Mesaj göndərilmədi');
    setSending(false);
  };

  const sendSticker = async (emoji) => {
    if (!activeConversationId || sending) return;
    setStickersOpen(false);
    setSending(true);
    const res = await sendMessage(activeConversationId, { message: emoji, attachmentType: 'sticker' });
    if (!res?.success) showToast(res?.message || 'Stiker göndərilmədi');
    setSending(false);
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeConversationId) return;
    setUploading(true);
    try {
      const res = await uploadApi.single(file, 'chat');
      const url = typeof res?.data === 'string' ? res.data : (res?.data?.url || res?.data?.imageUrl || res?.data?.fileUrl);
      if (!url) { showToast('Şəkil URL alınmadı'); return; }
      const send = await sendMessage(activeConversationId, { message: text.trim(), attachmentUrl: url, attachmentType: 'image' });
      if (send?.success) setText('');
      else showToast(send?.message || 'Şəkil göndərilmədi');
    } catch { showToast('Şəkil yüklənmədi'); }
    finally { setUploading(false); }
  };

  const startSupport = async () => {
    const res = await startChat({ type: CHAT_TYPE.Support, initialMessage: 'Salam, dəstək lazımdır.' });
    if (res?.success) setChatOpen(true);
    else showToast(res?.message || 'Dəstək söhbəti açıla bilmədi');
  };

  const removeConversation = async () => {
    if (!confirmDeleteConv) return;
    const id = confirmDeleteConv.id;
    const res = await deleteConversation(id);
    if (res?.success) {
      showToast('Söhbət silindi');
      setConfirmDeleteConv(null);
      if (activeConversationId === id) setChatOpen(false);
    } else {
      showToast(res?.message || 'Söhbət silinmədi');
    }
  };

  const removeMessageForMe = async (m) => {
    if (!activeConversationId) return;
    const res = await deleteMessageForMe(activeConversationId, m.id);
    if (!res?.success) showToast(res?.message || 'Mesaj silinmədi');
  };

  const removeMessageEveryone = async (m) => {
    if (!activeConversationId) return;
    const res = await deleteMessageForEveryone(activeConversationId, m.id);
    if (!res?.success) showToast(res?.message || 'Mesaj silinmədi');
  };

  const showChat = chatOpen && activeConversation;

  return (
    <div className="min-h-[calc(100vh-90px)] bg-slate-50 py-8">
      {toast && (
        <div className="fixed top-20 right-6 z-[120] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <ConfirmModal
        open={!!confirmDeleteConv}
        title="Söhbəti sil"
        text="Bu söhbət sizin siyahınızdan silinəcək və köhnə mesajlar sizə görünməyəcək. Qarşı tərəf də silibsə, söhbət databazadan tam silinəcək."
        onClose={() => setConfirmDeleteConv(null)}
        onConfirm={removeConversation}
      />

      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Mesajlar</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">İstifadəçilər, mağazalar və baytarlarla yazışmalarınız</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl border ${connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {connected ? <LuWifi size={14} /> : <LuWifiOff size={14} />}
              {connected ? 'Online' : 'Offline'}
            </span>
            <button onClick={startSupport} className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition">
              <LuLifeBuoy size={15} />Dəstəyə yaz
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden grid lg:grid-cols-[390px_1fr]" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          {/* LEFT */}
          <aside className="border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Söhbət axtar..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingConversations ? (
                <div className="p-2 space-y-3">
                  {[...Array(7)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-full grid place-items-center p-6 text-center">
                  <div>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 grid place-items-center"><LuInbox size={26} /></div>
                    <p className="text-sm font-black text-slate-700 mt-3">Söhbət yoxdur</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Heyvan, məhsul və ya baytar səhifəsindən söhbət başlada bilərsiniz.</p>
                  </div>
                </div>
              ) : (
                filtered.map((c) => {
                  const Icon = typeIcon(c.type, c.typeText);
                  const active = chatOpen && Number(activeConversationId) === Number(c.id);
                  return (
                    <div key={c.id} role="button" tabIndex={0} onClick={() => handleOpenConversation(c.id)}
                      className={`group w-full text-left p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer ${active ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                      <Avatar name={c.targetFullName || c.title} src={c.targetImageUrl} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-black truncate ${active ? 'text-sky-700' : 'text-slate-900'}`}>{c.targetFullName || c.title || 'Söhbət'}</p>
                          {c.unreadCount > 0 && (
                            <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black grid place-items-center">{c.unreadCount > 99 ? '99+' : c.unreadCount}</span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 truncate flex items-center gap-1"><Icon size={12} />{typeLabel(c.type, c.typeText)}</p>
                        <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{c.lastMessage || 'Mesaj yoxdur'}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteConv(c); }} title="Söhbəti sil"
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition">
                        <LuTrash2 size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT */}
          <main className="flex flex-col h-full overflow-hidden bg-slate-50/60">
            {!showChat ? (
              <div className="flex-1 grid place-items-center p-8 text-center">
                <div>
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-50 text-sky-600 grid place-items-center">
                    <LuMessageCircle size={32} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-4">Söhbət seçin</h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Mesajlaşmaya başlamaq üçün soldan söhbət seçin.</p>
                </div>
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={handleCloseChat}
                      className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition shrink-0" title="Geri">
                      <LuArrowLeft size={18} />
                    </button>
                    <Avatar name={activeConversation.targetFullName || activeConversation.title} src={activeConversation.targetImageUrl} />
                    <div className="min-w-0">
                      <h2 className="font-black text-slate-900 truncate">{activeConversation.targetFullName || activeConversation.title || 'Söhbət'}</h2>
                      <p className="text-xs font-semibold text-slate-400 truncate">{typeLabel(activeConversation.type, activeConversation.typeText)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeConversation.unreadCount > 0 && (
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">{activeConversation.unreadCount} oxunmamış</span>
                    )}
                    <button onClick={() => setConfirmDeleteConv(activeConversation)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition" title="Söhbəti sil">
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* MESSAGES */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {loadingMessages ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`h-12 rounded-2xl animate-pulse ${i % 2 ? 'ml-auto w-2/3 bg-sky-100' : 'w-2/3 bg-white'}`} />
                      ))}
                    </div>
                  ) : activeMessages.length === 0 ? (
                    <div className="h-full grid place-items-center text-center">
                      <div>
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-white text-slate-400 grid place-items-center border border-slate-200"><LuInbox size={26} /></div>
                        <p className="text-sm font-black text-slate-700 mt-3">Hələ mesaj yoxdur</p>
                        <p className="text-xs font-semibold text-slate-400 mt-1">İlk mesajı göndərin.</p>
                      </div>
                    </div>
                  ) : (
                    activeMessages.filter((m) => !m.isDeletedForEveryone && m.message !== 'Mesaj silinib').map((m) => {
                      const mine = !!m.isMine;
                      const sticker = m.attachmentType === 'sticker' && !m.attachmentUrl;
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`rounded-3xl px-4 py-3 shadow-sm ${mine ? 'bg-sky-600 text-white rounded-br-lg' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-lg'}`}>
                              {!mine && <p className="text-[10px] font-black mb-1 opacity-70">{m.senderFullName || 'İstifadəçi'}</p>}
                              {m.attachmentUrl && isImage(m) && (
                                <a href={m.attachmentUrl} target="_blank" rel="noreferrer">
                                  <img src={m.attachmentUrl} alt="" className="max-w-xs rounded-2xl border border-white/20 mb-2" />
                                </a>
                              )}
                              {m.attachmentUrl && !isImage(m) && (
                                <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className={`block text-xs font-bold underline mb-2 ${mine ? 'text-white' : 'text-sky-600'}`}>Əlavəyə bax</a>
                              )}
                              {m.message && <p className={`font-semibold leading-relaxed whitespace-pre-wrap ${sticker ? 'text-4xl' : 'text-sm'}`}>{m.message}</p>}
                              <p className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${mine ? 'text-sky-100 justify-end' : 'text-slate-400'}`}>
                                {m.createdAt ? formatDateTime(m.createdAt) : ''}
                                {mine && <LuCheckCheck size={12} />}
                              </p>
                            </div>
                            <div className={`mt-1 flex gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                              <button onClick={() => removeMessageForMe(m)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition">Məndə sil</button>
                              {mine && (
                                <button onClick={() => removeMessageEveryone(m)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">Hamı üçün sil</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* INPUT */}
                <form onSubmit={submit} className="bg-white border-t border-slate-200 p-4 space-y-2 shrink-0">
                  {stickersOpen && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2">
                      {STICKERS.map((s) => (
                        <button key={s} type="button" onClick={() => sendSticker(s)} className="w-10 h-10 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-xl transition">{s}</button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-3">
                    <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 grid place-items-center hover:bg-sky-50 hover:text-sky-600 transition disabled:opacity-50" title="Şəkil göndər">
                      <LuImage size={20} />
                    </button>
                    <button type="button" onClick={() => setStickersOpen((v) => !v)}
                      className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 grid place-items-center hover:bg-sky-50 hover:text-sky-600 transition" title="Stiker">
                      <LuSmile size={20} />
                    </button>
                    <textarea value={text} onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}
                      rows={1} placeholder="Mesaj yaz..."
                      className="flex-1 max-h-32 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-sky-500 resize-none" />
                    <button type="submit" disabled={!text.trim() || sending || uploading}
                      className="w-12 h-12 rounded-2xl bg-sky-600 text-white grid place-items-center hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {sending ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <LuSend size={20} />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </main>
        </div>

        {!user && <p className="mt-4 text-xs font-semibold text-rose-600">Mesajlaşma üçün daxil olmaq lazımdır.</p>}
      </div>
    </div>
  );
};

export default Messages;