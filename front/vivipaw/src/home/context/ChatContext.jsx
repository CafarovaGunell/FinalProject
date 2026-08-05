import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as signalR from '@microsoft/signalr';
import { chatApi } from '../../services/endpoints';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

const HUB_URL = 'http://localhost:5123/hubs/chat';

const getAccessToken = () => {
  const directKeys = [
    'accessToken',
    'token',
    'jwt',
    'viviPawAccessToken',
    'vivipaw_accessToken',
  ];

  for (const key of directKeys) {
    const v = localStorage.getItem(key);
    if (v) return v.replace(/^"|"$/g, '');
  }

  const objectKeys = [
    'auth',
    'authData',
    'tokens',
    'user',
    'vivipaw_auth',
    'viviPawAuth',
  ];

  for (const key of objectKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const obj = JSON.parse(raw);

      const token =
        obj?.accessToken ||
        obj?.token ||
        obj?.jwt ||
        obj?.data?.accessToken ||
        obj?.data?.token ||
        obj?.tokens?.accessToken;

      if (token) return token;
    } catch {
      // ignore
    }
  }

  return '';
};

const idOf = (x) => x?.id ?? x?.userId ?? x?.Id;

const mergeById = (list, item) => {
  const id = item?.id;
  if (!id) return list;

  const exists = list.some((x) => Number(x.id) === Number(id));

  if (exists) {
    return list.map((x) =>
      Number(x.id) === Number(id) ? { ...x, ...item } : x
    );
  }

  return [item, ...list];
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = idOf(user);

  const [connection, setConnection] = useState(null);
  const [connected, setConnected] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [messagesById, setMessagesById] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const activeRef = useRef(activeConversationId);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    activeRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const loadConversations = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return [];
    }

    setLoadingConversations(true);

    const res = await chatApi.conversations().catch(() => null);
    const list = res?.success && Array.isArray(res.data) ? res.data : [];

    setConversations(list);
    setLoadingConversations(false);

    return list;
  }, [userId]);

  const loadMessages = useCallback(async (conversationId, page = 1, pageSize = 50) => {
    if (!conversationId) return [];

    setLoadingMessages(true);

    const res = await chatApi.messages(conversationId, page, pageSize).catch(() => null);
    const list = res?.success && Array.isArray(res.data) ? res.data : [];

    setMessagesById((prev) => ({
      ...prev,
      [conversationId]: list,
    }));

    setLoadingMessages(false);

    return list;
  }, []);

  const joinConversation = useCallback(async (conversationId) => {
    if (!connection || !connected || !conversationId) return;

    await connection
      .invoke('JoinConversation', Number(conversationId))
      .catch(() => null);
  }, [connection, connected]);

  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId) return;

    await chatApi.read(conversationId).catch(() => null);

    setConversations((prev) =>
      prev.map((c) =>
        Number(c.id) === Number(conversationId)
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  }, []);

  const openConversation = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setActiveConversationId(conversationId);

    await joinConversation(conversationId);
    await loadMessages(conversationId);
    await markAsRead(conversationId);
  }, [joinConversation, loadMessages, markAsRead]);

  const startChat = useCallback(async (dto) => {
    const res = await chatApi.start(dto).catch((e) => ({
      success: false,
      message: e?.response?.data?.message || 'Söhbət açıla bilmədi',
    }));

    if (res?.success && res.data) {
      setConversations((prev) => mergeById(prev, res.data));
      await openConversation(res.data.id);
    }

    return res;
  }, [openConversation]);

  const sendMessage = useCallback(async (conversationId, payload) => {
    if (!conversationId) {
      return { success: false, message: 'Söhbət seçilməyib' };
    }

    const message = payload?.message?.trim();
    const attachmentUrl = payload?.attachmentUrl;

    if (!message && !attachmentUrl) {
      return { success: false, message: 'Mesaj boş ola bilməz' };
    }

    const res = await chatApi.send(conversationId, payload).catch((e) => ({
      success: false,
      message: e?.response?.data?.message || 'Mesaj göndərilmədi',
    }));

    if (res?.success && res.data) {
      setMessagesById((prev) => {
        const old = prev[conversationId] || [];

        if (old.some((m) => Number(m.id) === Number(res.data.id))) {
          return prev;
        }

        return {
          ...prev,
          [conversationId]: [...old, res.data],
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(conversationId)
            ? {
                ...c,
                lastMessage: res.data.message || 'Fayl göndərildi',
                lastMessageAt: res.data.createdAt,
              }
            : c
        )
      );
    }

    return res;
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    const res = await chatApi.deleteConversation(conversationId).catch((e) => ({
      success: false,
      message: e?.response?.data?.message || 'Söhbət silinmədi',
    }));

    if (res?.success) {
      setConversations((prev) =>
        prev.filter((c) => Number(c.id) !== Number(conversationId))
      );

      setMessagesById((prev) => {
        const copy = { ...prev };
        delete copy[conversationId];
        return copy;
      });

      if (Number(activeRef.current) === Number(conversationId)) {
        setActiveConversationId(null);
      }
    }

    return res;
  }, []);

  const deleteMessageForMe = useCallback(async (conversationId, messageId) => {
    const res = await chatApi.deleteMessageForMe(messageId).catch((e) => ({
      success: false,
      message: e?.response?.data?.message || 'Mesaj silinmədi',
    }));

    if (res?.success) {
      setMessagesById((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(
          (m) => Number(m.id) !== Number(messageId)
        ),
      }));
    }

    return res;
  }, []);

  const deleteMessageForEveryone = useCallback(async (conversationId, messageId) => {
    const res = await chatApi.deleteMessageForEveryone(messageId).catch((e) => ({
      success: false,
      message: e?.response?.data?.message || 'Mesaj silinmədi',
    }));

    if (res?.success) {
      setMessagesById((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          Number(m.id) === Number(messageId)
            ? {
                ...m,
                message: 'Mesaj silinib',
                attachmentUrl: null,
                attachmentType: null,
                isDeletedForEveryone: true,
              }
            : m
        ),
      }));

      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(conversationId)
            ? {
                ...c,
                lastMessage:
                  Number(c.id) === Number(conversationId)
                    ? (c.lastMessage || '')
                    : c.lastMessage,
              }
            : c
        )
      );
    }

    return res;
  }, []);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setMessagesById({});
      setActiveConversationId(null);
      return;
    }

    loadConversations();
  }, [userId, loadConversations]);

  useEffect(() => {
    if (!userId) return;

    const token = getAccessToken();
    if (!token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getAccessToken(),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on('ReceiveMessage', (msg) => {
      const conversationId = msg.conversationId;

      setMessagesById((prev) => {
        const old = prev[conversationId] || [];

        if (old.some((m) => Number(m.id) === Number(msg.id))) {
          return prev;
        }

        return {
          ...prev,
          [conversationId]: [...old, msg],
        };
      });

      setConversations((prev) => {
        const exists = prev.some((c) => Number(c.id) === Number(conversationId));

        if (!exists) {
          loadConversations();
          return prev;
        }

        return prev.map((c) => {
          if (Number(c.id) !== Number(conversationId)) return c;

          const isActive = Number(activeRef.current) === Number(conversationId);
          const isMine = Number(msg.senderUserId) === Number(userId);

          return {
            ...c,
            lastMessage: msg.message || 'Fayl göndərildi',
            lastMessageAt: msg.createdAt,
            unreadCount: isActive || isMine
              ? 0
              : Number(c.unreadCount || 0) + 1,
          };
        });
      });

      if (Number(activeRef.current) === Number(conversationId)) {
        chatApi.read(conversationId).catch(() => null);
      }
    });

    conn.on('ConversationUpdated', (e) => {
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(e.conversationId)
            ? {
                ...c,
                lastMessage: e.lastMessage,
                lastMessageAt: e.lastMessageAt,
              }
            : c
        )
      );
    });

    conn.on('MessageDeleted', (e) => {
      setMessagesById((prev) => ({
        ...prev,
        [e.conversationId]: (prev[e.conversationId] || []).map((m) =>
          Number(m.id) === Number(e.messageId)
            ? {
                ...m,
                message: 'Mesaj silinib',
                attachmentUrl: null,
                attachmentType: null,
                isDeletedForEveryone: true,
              }
            : m
        ),
      }));
    });

    conn.on('ConversationDeleted', (e) => {
      if (Number(e.userId) !== Number(userId)) return;

      setConversations((prev) =>
        prev.filter((c) => Number(c.id) !== Number(e.conversationId))
      );

      setMessagesById((prev) => {
        const copy = { ...prev };
        delete copy[e.conversationId];
        return copy;
      });

      if (Number(activeRef.current) === Number(e.conversationId)) {
        setActiveConversationId(null);
      }
    });

    conn.onreconnected(() => {
      conversationsRef.current.forEach((c) => {
        conn.invoke('JoinConversation', Number(c.id)).catch(() => null);
      });
    });

    conn
      .start()
      .then(() => {
        setConnection(conn);
        setConnected(true);
      })
      .catch(() => {
        setConnected(false);
      });

    return () => {
      setConnected(false);
      conn.stop().catch(() => null);
    };
  }, [userId, loadConversations]);

  useEffect(() => {
    if (!connection || !connected) return;

    conversations.forEach((c) => {
      connection.invoke('JoinConversation', Number(c.id)).catch(() => null);
    });
  }, [connection, connected, conversations]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => Number(c.id) === Number(activeConversationId)) || null;
  }, [conversations, activeConversationId]);

  const activeMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesById[activeConversationId] || [];
  }, [messagesById, activeConversationId]);

  const unreadTotal = useMemo(() => {
    return conversations.reduce((sum, c) => sum + Number(c.unreadCount || 0), 0);
  }, [conversations]);

  const value = {
    connected,

    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    unreadTotal,

    loadingConversations,
    loadingMessages,

    loadConversations,
    loadMessages,
    openConversation,
    startChat,
    sendMessage,
    markAsRead,

    deleteConversation,
    deleteMessageForMe,
    deleteMessageForEveryone,

    setActiveConversationId,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error('useChat must be used inside ChatProvider');
  }

  return ctx;
};



