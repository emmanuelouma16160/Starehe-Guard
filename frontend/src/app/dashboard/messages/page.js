// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Send, MessageCircle, Users, AlertCircle } from 'lucide-react';
// import TopBar from '@/components/TopBar';
// import api from '@/lib/api';
// import useAuthStore from '@/store/useAuthStore';
// import toast from 'react-hot-toast';

// export default function MessagesPage() {
//   const { user } = useAuthStore();
//   const [conversations, setConversations] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [showBroadcast, setShowBroadcast] = useState(false);
//   const [broadcastData, setBroadcastData] = useState({
//     content: '',
//     roles: [],
//   });
//   const messagesEndRef = useRef(null);

//   // Load conversations
//   useEffect(() => {
//     const loadConversations = async () => {
//       try {
//         const { data } = await api.get('/messages/conversations');
//         setConversations(data);
//       } catch {
//         toast.error('Failed to load conversations');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadConversations();
//   }, []);

//   // Load users for new chat
//   useEffect(() => {
//     const loadUsers = async () => {
//       try {
//         const { data } = await api.get('/auth/users?limit=100');
//         setUsers(data.users.filter(u => u._id !== user.id));
//       } catch {
//         // Silent fail
//       }
//     };
//     loadUsers();
//   }, [user.id]);

//   // Load messages when user selected
//   useEffect(() => {
//     if (selectedUser) {
//       loadMessages(selectedUser._id);
//     }
//   }, [selectedUser]);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const loadMessages = async (userId) => {
//     try {
//       const { data } = await api.get(`/messages/${userId}`);
//       setMessages(data.messages);
//     } catch {
//       toast.error('Failed to load messages');
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedUser) return;

//     setSending(true);
//     try {
//       const { data } = await api.post('/messages/send', {
//         receiverId: selectedUser._id,
//         content: newMessage.trim(),
//         type: 'direct',
//       });

//       setMessages(prev => [data.data, ...prev]);
//       setNewMessage('');
//       toast.success('Message sent');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to send message');
//     } finally {
//       setSending(false);
//     }
//   };

//   const sendBroadcast = async () => {
//     if (!broadcastData.content.trim() || broadcastData.roles.length === 0) {
//       toast.error('Please enter content and select at least one role');
//       return;
//     }

//     setSending(true);
//     try {
//       await api.post('/messages/broadcast', broadcastData);
//       toast.success('Broadcast sent successfully');
//       setShowBroadcast(false);
//       setBroadcastData({ content: '', roles: [] });
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to send broadcast');
//     } finally {
//       setSending(false);
//     }
//   };

//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString('en-KE', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   return (
//     <>
//       <TopBar title="Messages" subtitle="Communicate with staff and admins" />
//       <div className="p-6 max-w-6xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Conversations List */}
//           <div className="lg:col-span-1">
//             <div className="card h-[600px] flex flex-col">
//               <div className="flex items-center justify-between p-3 border-b border-gray-100">
//                 <h2 className="font-semibold text-primary text-sm">Conversations</h2>
//                 <button
//                   onClick={() => setShowBroadcast(!showBroadcast)}
//                   className="p-2 text-accent hover:bg-accent/10 rounded-lg"
//                 >
//                   <Users size={18} />
//                 </button>
//               </div>

//               {showBroadcast && (
//                 <div className="p-3 border-b border-accent/20 bg-accent/5">
//                   <h3 className="text-sm font-semibold text-primary mb-2">Broadcast Message</h3>
//                   <textarea
//                     value={broadcastData.content}
//                     onChange={(e) => setBroadcastData(prev => ({ ...prev, content: e.target.value }))}
//                     placeholder="Enter broadcast message..."
//                     rows={3}
//                     className="input w-full text-sm"
//                   />
//                   <div className="mt-2">
//                     <label className="text-xs font-medium text-gray-600">Send to roles:</label>
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       {['super_admin', 'admin', 'guard', 'teacher', 'parent'].map(role => (
//                         <button
//                           key={role}
//                           onClick={() => {
//                             setBroadcastData(prev => ({
//                               ...prev,
//                               roles: prev.roles.includes(role)
//                                 ? prev.roles.filter(r => r !== role)
//                                 : [...prev.roles, role],
//                             }));
//                           }}
//                           className={`text-xs px-3 py-1 rounded-full ${
//                             broadcastData.roles.includes(role)
//                               ? 'bg-accent text-white'
//                               : 'bg-gray-100 text-gray-600'
//                           }`}
//                         >
//                           {role}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     onClick={sendBroadcast}
//                     disabled={sending}
//                     className="btn-primary w-full mt-2 text-sm disabled:opacity-50"
//                   >
//                     {sending ? 'Sending...' : 'Send Broadcast'}
//                   </button>
//                 </div>
//               )}

//               <div className="flex-1 overflow-y-auto">
//                 {loading ? (
//                   <div className="text-center py-8">
//                     <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
//                   </div>
//                 ) : conversations.length === 0 ? (
//                   <div className="text-center py-8 text-gray-400">
//                     <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
//                     <p className="text-sm">No conversations</p>
//                   </div>
//                 ) : (
//                   conversations.map((conv) => (
//                     <button
//                       key={conv.participant._id}
//                       onClick={() => setSelectedUser(conv.participant)}
//                       className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 transition-colors ${
//                         selectedUser?._id === conv.participant._id ? 'bg-accent/5' : ''
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
//                           <span className="text-accent font-bold text-sm">
//                             {conv.participant.name.charAt(0)}
//                           </span>
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="font-semibold text-primary text-sm truncate">
//                             {conv.participant.name}
//                           </p>
//                           <p className="text-xs text-gray-400 truncate">
//                             {conv.participant.role} · {conv.participant.phone}
//                           </p>
//                           {conv.lastMessage && (
//                             <p className="text-xs text-gray-400 truncate mt-0.5">
//                               {conv.lastMessage.content}
//                             </p>
//                           )}
//                         </div>
//                         {conv.unreadCount > 0 && (
//                           <span className="w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
//                             {conv.unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </button>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Messages Area */}
//           <div className="lg:col-span-2">
//             <div className="card h-[600px] flex flex-col">
//               {selectedUser ? (
//                 <>
//                   {/* Chat Header */}
//                   <div className="p-3 border-b border-gray-100 flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
//                       <span className="text-accent font-bold">
//                         {selectedUser.name.charAt(0)}
//                       </span>
//                     </div>
//                     <div>
//                       <p className="font-semibold text-primary text-sm">{selectedUser.name}</p>
//                       <p className="text-xs text-gray-400">{selectedUser.role}</p>
//                     </div>
//                     <div className="ml-auto text-xs text-gray-400">
//                       {selectedUser.phone && `📞 ${selectedUser.phone}`}
//                     </div>
//                   </div>

//                   {/* Messages */}
//                   <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                     {messages.length === 0 ? (
//                       <div className="text-center py-8 text-gray-400">
//                         <p className="text-sm">No messages yet</p>
//                         <p className="text-xs">Send a message to start the conversation</p>
//                       </div>
//                     ) : (
//                       messages.map((msg) => (
//                         <div
//                           key={msg._id}
//                           className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
//                         >
//                           <div
//                             className={`max-w-[70%] p-3 rounded-xl ${
//                               msg.sender._id === user.id
//                                 ? 'bg-accent text-white'
//                                 : 'bg-gray-100 text-primary'
//                             }`}
//                           >
//                             <p className="text-sm">{msg.content}</p>
//                             <p className="text-xs opacity-70 mt-1">
//                               {formatTime(msg.createdAt)}
//                               {msg.isRead && msg.sender._id === user.id && ' ✓✓'}
//                             </p>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                     <div ref={messagesEndRef} />
//                   </div>

//                   {/* Message Input */}
//                   <div className="p-3 border-t border-gray-100 flex gap-3">
//                     <input
//                       type="text"
//                       value={newMessage}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//                       placeholder="Type a message..."
//                       className="input flex-1"
//                     />
//                     <button
//                       onClick={sendMessage}
//                       disabled={sending || !newMessage.trim()}
//                       className="btn-primary disabled:opacity-50"
//                     >
//                       <Send size={18} />
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex-1 flex items-center justify-center text-center text-gray-400">
//                   <div>
//                     <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
//                     <p className="font-medium">Select a conversation</p>
//                     <p className="text-sm">Choose a user from the list to start messaging</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, AlertCircle } from 'lucide-react';
import TopBar from '@/components/TopBar';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    content: '',
    roles: [],
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/auth/users?limit=100');
      setUsers(data.users.filter(u => u._id !== user?.id));
    } catch {
      // Silent fail
    }
  };

  const loadMessages = async (userId) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data.messages);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const { data } = await api.post('/messages/send', {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
        type: 'direct',
      });

      setMessages(prev => [data.data, ...prev]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastData.content.trim() || broadcastData.roles.length === 0) {
      toast.error('Please enter content and select at least one role');
      return;
    }

    setSending(true);
    try {
      await api.post('/messages/broadcast', broadcastData);
      toast.success('Broadcast sent successfully');
      setShowBroadcast(false);
      setBroadcastData({ content: '', roles: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <TopBar title="Messages" subtitle="Communicate with staff and admins" />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="card h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <h2 className="font-semibold text-primary text-sm">Conversations</h2>
                <button
                  onClick={() => setShowBroadcast(!showBroadcast)}
                  className="p-2 text-accent hover:bg-accent/10 rounded-lg"
                >
                  <Users size={18} />
                </button>
              </div>

              {showBroadcast && (
                <div className="p-3 border-b border-accent/20 bg-accent/5">
                  <h3 className="text-sm font-semibold text-primary mb-2">Broadcast Message</h3>
                  <textarea
                    value={broadcastData.content}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter broadcast message..."
                    rows={3}
                    className="input w-full text-sm"
                  />
                  <div className="mt-2">
                    <label className="text-xs font-medium text-gray-600">Send to roles:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['super_admin', 'admin', 'guard', 'teacher', 'parent'].map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            setBroadcastData(prev => ({
                              ...prev,
                              roles: prev.roles.includes(role)
                                ? prev.roles.filter(r => r !== role)
                                : [...prev.roles, role],
                            }));
                          }}
                          className={`text-xs px-3 py-1 rounded-full ${
                            broadcastData.roles.includes(role)
                              ? 'bg-accent text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={sendBroadcast}
                    disabled={sending}
                    className="btn-primary w-full mt-2 text-sm disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Broadcast'}
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No conversations</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.participant._id}
                      onClick={() => setSelectedUser(conv.participant)}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                        selectedUser?._id === conv.participant._id ? 'bg-accent/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent font-bold text-sm">
                            {conv.participant.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary text-sm truncate">
                            {conv.participant.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {conv.participant.role} · {conv.participant.phone}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            <div className="card h-[600px] flex flex-col">
              {selectedUser ? (
                <>
                  <div className="p-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-bold">
                        {selectedUser.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{selectedUser.name}</p>
                      <p className="text-xs text-gray-400">{selectedUser.role}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      {selectedUser.phone && `📞 ${selectedUser.phone}`}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-xl ${
                              msg.sender._id === user.id
                                ? 'bg-accent text-white'
                                : 'bg-gray-100 text-primary'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(msg.createdAt)}
                              {msg.isRead && msg.sender._id === user.id && ' ✓✓'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 border-t border-gray-100 flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="input flex-1"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="btn-primary disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-gray-400">
                  <div>
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Select a conversation</p>
                    <p className="text-sm">Choose a user from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}