import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Send, Search, User, MessageSquare, Bug, Phone, Mail, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomersWithChats, useCustomerMessages, useSendMessage, useMarkAsRead } from '../shared/hooks/useCommunications';
import { LoadingSpinner, EmptyState } from '../shared/components/ui';
import { formatFullName } from '../shared/utils/formatters';
import { format as formatDate, isToday, isYesterday } from 'date-fns';
import { testChatFunctionality, testSendMessage } from '../utils/chatDebug';
import { toast } from 'react-hot-toast';

// Memoized Customer List Item Component
const CustomerListItem = React.memo(({ 
  customer, 
  isSelected, 
  onSelect, 
  unreadCount, 
  lastMessage 
}: {
  customer: any;
  isSelected: boolean;
  onSelect: (customer: any) => void;
  unreadCount: number;
  lastMessage: any;
}) => {
  const handleClick = useCallback(() => {
    onSelect(customer);
  }, [customer, onSelect]);

  const getLastMessagePreview = useCallback(() => {
    if (!lastMessage) return 'No messages yet';

    const preview = lastMessage.message.length > 50
      ? lastMessage.message.substring(0, 50) + '...'
      : lastMessage.message;

    if (lastMessage.log_type === 'order_status_update') {
      return `🔔 ${preview}`;
    } else if (lastMessage.sender_type === 'staff') {
      return `You: ${preview}`;
    } else {
      return preview;
    }
  }, [lastMessage]);

  const formatLastMessageTime = useCallback((createdAt: string) => {
    const date = new Date(createdAt);
    if (isToday(date)) {
      return formatDate(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return formatDate(date, 'MMM dd');
    }
  }, []);

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected
          ? 'bg-primary-50 border-primary-200 border-l-4 border-l-primary-500'
          : unreadCount > 0
            ? 'bg-blue-50'
            : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-white">
              {customer.first_name?.[0]?.toUpperCase() || 'C'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
              {formatFullName(customer.first_name, customer.last_name)}
              {unreadCount > 0 && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </p>
            <p className="text-xs text-gray-500 truncate">{customer.phone || 'No phone number'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium flex-shrink-0">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
          {getLastMessagePreview()}
        </p>
        {lastMessage && (
          <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
            {formatLastMessageTime(lastMessage.created_at)}
          </p>
        )}
      </div>
    </div>
  );
});

// Memoized Message Component
const MessageItem = React.memo(({ message, currentStaffId }: { message: any; currentStaffId: string | null }) => {
  const isSystemMessage = message.log_type === 'order_status_update';
  const isStaffMessage = message.sender_type === 'staff' && !isSystemMessage;
  const isCurrentStaff = message.staff_id === currentStaffId;

  const formatMessageTime = useCallback((createdAt: string) => {
    const date = new Date(createdAt);
    if (isToday(date)) {
      return formatDate(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${formatDate(date, 'HH:mm')}`;
    } else {
      return formatDate(date, 'MMM dd, HH:mm');
    }
  }, []);

  return (
    <div
      className={`flex ${
        isSystemMessage
          ? 'justify-center'
          : isStaffMessage
            ? 'justify-end'
            : 'justify-start'
      }`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isSystemMessage
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : isStaffMessage
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        {isSystemMessage && (
          <div className="flex items-center mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <p className="text-xs font-medium text-blue-700">System Notification</p>
          </div>
        )}
        <p className="text-sm break-words">{message.message}</p>
        <p
          className={`text-xs mt-1 ${
            isSystemMessage
              ? 'text-blue-600'
              : isStaffMessage
                ? 'text-primary-200'
                : 'text-gray-500'
          }`}
        >
          {formatMessageTime(message.created_at)}
          {isStaffMessage && (
            <span className="ml-1">
              • Staff{message.staff && ` (${formatFullName(message.staff.first_name, message.staff.last_name)})`}
            </span>
          )}
          {!isStaffMessage && !isSystemMessage && (
            <span className="ml-1">• Customer</span>
          )}
          {isSystemMessage && (
            <span className="ml-1">• Order Update</span>
          )}
        </p>
      </div>
    </div>
  );
});

export default function ChatPage() {
  const { profile } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const { data: customers = [], isLoading: customersLoading } = useCustomersWithChats(searchTerm);
  const { data: messages = [], isLoading: messagesLoading } = useCustomerMessages(selectedCustomer?.id);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Memoized filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter((customer: any) => {
      const fullName = formatFullName(customer.first_name, customer.last_name).toLowerCase();
      const phone = customer.phone?.toLowerCase() || '';
      return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
    });
  }, [customers, searchTerm]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when customer is selected
  useEffect(() => {
    if (selectedCustomer?.id && getUnreadCount(selectedCustomer) > 0) {
      markAsReadMutation.mutate(selectedCustomer.id);
    }
  }, [selectedCustomer?.id, markAsReadMutation]);

  // Typing indicator simulation
  useEffect(() => {
    if (sendMessageMutation.isPending) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [sendMessageMutation.isPending]);

  const getUnreadCount = useCallback((customer: any) => {
    return customer.unread_count || 0;
  }, []);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedCustomer?.id) {
      console.log('Cannot send message:', {
        messageEmpty: !message.trim(),
        noCustomer: !selectedCustomer?.id,
        message: message.trim(),
        customerId: selectedCustomer?.id
      });
      return;
    }

    console.log('Sending message:', {
      customerId: selectedCustomer.id,
      staffId: profile?.id || null,
      message: message.trim(),
    });

    sendMessageMutation.mutate({
      customerId: selectedCustomer.id,
      staffId: profile?.id || null,
      message: message.trim(),
    });

    setMessage('');
  }, [message, selectedCustomer, profile, sendMessageMutation]);

  const handleCustomerSelect = useCallback((customer: any) => {
    setSelectedCustomer(customer);
  }, []);

  const handleDebugTest = useCallback(async () => {
    console.log('Running chat debug tests...');
    await testChatFunctionality();

    if (selectedCustomer?.id && profile?.id) {
      await testSendMessage(selectedCustomer.id, profile.id, 'Debug test message');
    }
  }, [selectedCustomer, profile]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search customers..."]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Escape to go back to customer list on mobile
      if (e.key === 'Escape' && selectedCustomer && window.innerWidth < 1024) {
        setSelectedCustomer(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCustomer]);

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Customer List */}
      <div className={`${selectedCustomer ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-gray-200 bg-white flex-col`}>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="input pl-10 pr-20"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search customers"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hidden sm:block">
              Ctrl+K
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {customersLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer: any) => {
              const unreadCount = getUnreadCount(customer);
              const lastMessage = customer.latest_message;

              return (
                <CustomerListItem
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedCustomer?.id === customer.id}
                  onSelect={handleCustomerSelect}
                  unreadCount={unreadCount}
                  lastMessage={lastMessage}
                />
              );
            })
          ) : (
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="No conversations"
              description="Customer conversations will appear here."
            />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedCustomer ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">
                      {selectedCustomer.first_name?.[0]?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {formatFullName(selectedCustomer.first_name, selectedCustomer.last_name)}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 overflow-hidden">
                      {selectedCustomer.phone && (
                        <div className="flex items-center space-x-1 min-w-0">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{selectedCustomer.phone}</span>
                        </div>
                      )}
                      {selectedCustomer.email && (
                        <div className="flex items-center space-x-1 min-w-0">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{selectedCustomer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  {selectedCustomer.latest_message && (
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="hidden sm:inline">Last message: {formatDate(new Date(selectedCustomer.latest_message.created_at), 'MMM dd, HH:mm')}</span>
                      <span className="sm:hidden">{formatDate(new Date(selectedCustomer.latest_message.created_at), 'HH:mm')}</span>
                    </div>
                  )}
                  {getUnreadCount(selectedCustomer) > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      {getUnreadCount(selectedCustomer)} unread message{getUnreadCount(selectedCustomer) > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
            >
              {messagesLoading ? (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {messages.map((msg: any) => (
                    <MessageItem
                        key={msg.id}
                      message={msg}
                      currentStaffId={profile?.id || null}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          <span className="text-xs text-gray-500 ml-2">Sending...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-2 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <div className="hidden sm:block">
                      <div>Messages: {messages.length} | Loading: {messagesLoading ? 'Yes' : 'No'}</div>
                      <div>Sending: {sendMessageMutation.isPending ? 'Yes' : 'No'}</div>
                      <div>Customer ID: {selectedCustomer?.id}</div>
                      <div>Staff ID: {profile?.id}</div>
                    </div>
                    <div className="sm:hidden text-xs">
                      <div>Msgs: {messages.length} | Sending: {sendMessageMutation.isPending ? 'Yes' : 'No'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDebugTest}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex items-center gap-1"
                    >
                      <Bug className="h-3 w-3" />
                      <span className="hidden sm:inline">Debug</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Type your message..."
                  className="flex-1 input text-sm sm:text-base"
                  disabled={sendMessageMutation.isPending}
                  autoComplete="off"
                  maxLength={1000}
                  aria-label="Message input"
                  aria-describedby="message-help"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:px-4"
                  aria-label={sendMessageMutation.isPending ? "Sending message..." : "Send message"}
                >
                  {sendMessageMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Character count and help text */}
              <div className="flex justify-between items-center mt-1">
                <div id="message-help" className="text-xs text-gray-500">
                  Press Enter to send
                </div>
                <div className="text-xs text-gray-400">
                  {message.length}/1000
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <EmptyState
              icon={<User className="h-12 w-12" />}
              title="Select a conversation"
              description="Choose a customer from the list to start chatting."
            />
          </div>
        )}
      </div>
    </div>
  );
}