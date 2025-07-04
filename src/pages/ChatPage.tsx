import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, User, MessageSquare, Bug } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCustomersWithChats, useCustomerMessages, useSendMessage, useMarkAsRead } from '../shared/hooks/useCommunications';
import { LoadingSpinner, EmptyState } from '../shared/components/ui';
import { formatFullName } from '../shared/utils/formatters';
import { format } from 'date-fns';
import { testChatFunctionality, testSendMessage } from '../utils/chatDebug';

export default function ChatPage() {
  const { profile } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: customers = [], isLoading: customersLoading } = useCustomersWithChats(searchTerm);
  const { data: messages = [], isLoading: messagesLoading } = useCustomerMessages(selectedCustomer?.id);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

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

  const handleSendMessage = (e: React.FormEvent) => {
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
  };

  const getUnreadCount = (customer: any) => {
    // Use the pre-calculated unread_count from the API
    return customer.unread_count || 0;
  };

  const handleDebugTest = async () => {
    console.log('Running chat debug tests...');
    await testChatFunctionality();

    if (selectedCustomer?.id && profile?.id) {
      await testSendMessage(selectedCustomer.id, profile.id, 'Debug test message');
    }
  };

  const getLastMessage = (customer: any) => {
    const lastMessage = customer.latest_message;
    if (!lastMessage) return 'No messages yet';

    const preview = lastMessage.message.length > 50
      ? lastMessage.message.substring(0, 50) + '...'
      : lastMessage.message;

    // Handle different message types
    if (lastMessage.log_type === 'order_status_update') {
      return `🔔 ${preview}`;
    } else if (lastMessage.sender_type === 'staff') {
      return `You: ${preview}`;
    } else {
      return preview;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Customer List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {customersLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : customers.length > 0 ? (
            customers.map((customer: any) => {
              const unreadCount = getUnreadCount(customer);
              const lastMessage = customer.latest_message;

              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-primary-50 border-primary-200 border-l-4 border-l-primary-500'
                      : unreadCount > 0
                        ? 'bg-blue-50'
                        : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {customer.first_name?.[0]?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div>
                        <p className={`text-sm ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                          {formatFullName(customer.first_name, customer.last_name)}
                          {unreadCount > 0 && (
                            <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{customer.phone || 'No phone number'}</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {getLastMessage(customer)}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {format(new Date(lastMessage.created_at), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
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
      <div className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {selectedCustomer.first_name?.[0]?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {formatFullName(selectedCustomer.first_name, selectedCustomer.last_name)}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.phone || 'No phone number'}</p>
                  </div>
                </div>
                <div className="text-right">
                  {selectedCustomer.latest_message && (
                    <p className="text-xs text-gray-400">
                      Last message: {format(new Date(selectedCustomer.latest_message.created_at), 'MMM dd, HH:mm')}
                    </p>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messagesLoading ? (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {messages.map((msg: any) => {
                    const isSystemMessage = msg.log_type === 'order_status_update';
                    const isStaffMessage = msg.sender_type === 'staff' && !isSystemMessage;

                    return (
                      <div
                        key={msg.id}
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
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSystemMessage
                                ? 'text-blue-600'
                                : isStaffMessage
                                  ? 'text-primary-200'
                                  : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(msg.created_at), 'HH:mm')}
                            {isStaffMessage && msg.staff && (
                              <span className="ml-1">
                                • {formatFullName(msg.staff.first_name, msg.staff.last_name)}
                              </span>
                            )}
                            {isSystemMessage && (
                              <span className="ml-1">• Order Update</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <div>Messages: {messages.length} | Loading: {messagesLoading ? 'Yes' : 'No'}</div>
                      <div>Sending: {sendMessageMutation.isPending ? 'Yes' : 'No'}</div>
                      <div>Customer ID: {selectedCustomer?.id}</div>
                      <div>Staff ID: {profile?.id}</div>
                    </div>
                    <button
                      onClick={handleDebugTest}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex items-center gap-1"
                    >
                      <Bug className="h-3 w-3" />
                      Debug
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 input"
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="btn-primary"
                >
                  {sendMessageMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
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