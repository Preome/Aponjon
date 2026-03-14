import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dailyTip, setDailyTip] = useState('');
  const messagesEndRef = useRef(null);

  // Load daily tip
  useEffect(() => {
    fetchDailyTip();
  }, []);

  const fetchDailyTip = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gemini/tip', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDailyTip(data.tip);
    } catch (error) {
      console.error('Failed to fetch tip:', error);
    }
  };

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello ${user?.name || 'dear friend'}! 👋 I'm your **AI Health Assistant**. I'm here to provide health information, companionship, and support. How are you feeling today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-5)
        })
      });

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || "I'm here with you! 😊 How can I help?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm still here! 😊 The connection is a bit slow, but I'm listening. Could you try again?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are good exercises for seniors?",
    "How can I manage blood pressure?",
    "I'm feeling lonely today",
    "Medication tips?",
    "Healthy eating advice",
    "Tell me a joke"
  ];

  // Only show for elderly users
  if (user?.role !== 'elderly') return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all z-40 flex items-center justify-center animate-pulse"
          style={{ width: '80px', height: '80px' }}
        >
          <div className="text-center">
            <SparklesIcon className="h-8 w-8 mx-auto" />
            <span className="text-[10px] font-bold block -mt-1">Health Buddy</span>
          </div>
        </button>
      )}

      {/* Chat Window - Made wider */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-[450px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border-2 border-purple-100">
          {/* Header - Bigger text */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">Health Assistant</h3>
                  
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Daily Tip - Bigger text */}
            {dailyTip && (
              <div className="mt-3 bg-white/20 p-3 rounded-lg text-sm">
                <HeartIcon className="h-4 w-4 inline mr-2" />
                {dailyTip}
              </div>
            )}
          </div>

          {/* Messages - Bigger font */}
          <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <p className="whitespace-pre-line text-base">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Bigger */}
          <div className="p-3 border-t bg-white">
            <p className="text-sm text-gray-500 mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input - Bigger */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about health..."
                className="flex-1 px-5 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-3 text-center flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 mr-1" />
              Your friendly <span className="font-semibold mx-1">AI Health Assistant</span> - Always here to help
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;