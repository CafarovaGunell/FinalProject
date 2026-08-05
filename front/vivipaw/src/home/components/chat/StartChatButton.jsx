import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMessageCircle } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import AuthModal from '../AuthModal';
import { CHAT_TYPE } from '../../../utils/chat';

const idOf = (u) => u?.id ?? u?.userId ?? u?.Id;

const defaultLabel = (type) => {
  if (Number(type) === CHAT_TYPE.PET_ADOPTION) return 'Sahibə yaz';
  if (Number(type) === CHAT_TYPE.PRODUCT) return 'Mağazaya yaz';
  if (Number(type) === CHAT_TYPE.ORDER) return 'Mağazaya yaz';
  if (Number(type) === CHAT_TYPE.APPOINTMENT) return 'Mesaj yaz';
  if (Number(type) === CHAT_TYPE.SUPPORT) return 'Dəstəyə yaz';
  return 'Mesaj yaz';
};

const StartChatButton = ({
  type,
  targetUserId,

  petId,
  adoptionRequestId,
  petShopId,
  vetProfileId,

  productId,
  orderId,
  appointmentId,

  initialMessage,
  children,
  className = '',
  icon = true,
  disabled = false,
  disabledReason = '',
  onStarted,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startChat } = useChat();

  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const myId = idOf(user);

  const isSelfTarget = useMemo(() => {
    if (!targetUserId || !myId) return false;
    return String(targetUserId) === String(myId);
  }, [targetUserId, myId]);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2400);
  };

  const handleClick = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (disabled || isSelfTarget) {
      showToast(disabledReason || 'Bu söhbəti başlatmaq mümkün deyil');
      return;
    }

    setBusy(true);

 const dto = {
  type,
  targetUserId,

  petId,
  adoptionRequestId,
  petShopId,
  vetProfileId,

  productId,
  orderId,
  appointmentId,
};

    if (initialMessage) dto.initialMessage = initialMessage;

    const res = await startChat(dto);

    if (res?.success) {
      onStarted?.(res.data);
      navigate('/messages');
    } else {
      showToast(res?.message || 'Söhbət açıla bilmədi');
    }

    setBusy(false);
  };

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {toast && (
        <div className="fixed top-20 right-6 z-[100] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        title={disabledReason || defaultLabel(type)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${
          disabled || isSelfTarget
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-600/15'
        } ${className}`}
      >
        {icon && <LuMessageCircle size={16} />}
        {busy ? 'Açılır...' : (children || defaultLabel(type))}
      </button>
    </>
  );
};

export default StartChatButton;





