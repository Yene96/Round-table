import { useState, useCallback, useRef } from 'react';
import type { AIEntity, Message } from '@/types';
import { aiEntities, simulatedResponses, defaultTopics } from '@/data/entities';
import FluidBackground from '@/components/effects/FluidBackground';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ChatPanel from '@/components/ChatPanel';
import CommandInput from '@/components/CommandInput';

function App() {
  const [entities, setEntities] = useState<AIEntity[]>(aiEntities);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const processingRef = useRef(false);
  const responseIndexRef = useRef<Record<string, number>>({});

  const toggleEntity = useCallback((id: string) => {
    setEntities(prev => prev.map(e =>
      e.id === id ? { ...e, isActive: !e.isActive } : e
    ));
  }, []);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const simulateAIResponses = useCallback(async (_userMessage: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    const active = entities.filter(e => e.isActive);
    if (active.length === 0) {
      setIsProcessing(false);
      processingRef.current = false;
      return;
    }

    // Create context from previous messages
    const contextMessages = messages.slice(-6); // Last 6 messages for context
    const context = contextMessages.map(m => `${m.senderName}: ${m.content}`).join('\n');

    // Sequential responses with each AI seeing previous responses
    const responses: Message[] = [];

    for (let i = 0; i < active.length; i++) {
      const entity = active[i];

      // Set typing state
      setEntities(prev => prev.map(e =>
        e.id === entity.id ? { ...e, isTyping: true } : e
      ));

      // Delay based on entity's response speed
      const baseDelay = entity.responseDelay;
      const variance = Math.random() * 800;
      const contextMultiplier = 1 + (context.length > 200 ? 0.3 : 0);
      const totalDelay = (baseDelay + variance) * contextMultiplier;

      await new Promise(resolve => setTimeout(resolve, totalDelay));

      // Get response
      const entityResponses = simulatedResponses[entity.id];
      const idx = responseIndexRef.current[entity.id] || 0;
      const responseText = entityResponses[idx % entityResponses.length];
      responseIndexRef.current[entity.id] = idx + 1;

      // Create message
      const aiMessage: Message = {
        id: generateMessageId(),
        content: responseText,
        senderId: entity.id,
        senderName: entity.shortName,
        senderAvatar: entity.avatar,
        senderColor: entity.colorHex,
        timestamp: Date.now(),
        type: 'ai',
      };

      responses.push(aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      // Clear typing state
      setEntities(prev => prev.map(e =>
        e.id === entity.id ? { ...e, isTyping: false } : e
      ));

      // If there are previous responses in this round, "react" to them
      if (i > 0 && Math.random() > 0.5) {
        await new Promise(resolve => setTimeout(resolve, 600));

        // Pick an entity that already responded to "react"
        const reactingEntity = active[Math.floor(Math.random() * i)];
        setEntities(prev => prev.map(e =>
          e.id === reactingEntity.id ? { ...e, isTyping: true } : e
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));

        const followUpResponses = [
          `Building on ${entity.shortName}'s point, I see an interesting connection...`,
          `I appreciate ${entity.shortName}'s perspective, though I'd add that...`,
          `That aligns with my analysis, ${entity.shortName}. Consider also...`,
          `Fascinating take, ${entity.shortName}. From my angle...`,
          `I'd like to expand on what ${entity.shortName} mentioned...`,
        ];
        const followUpIdx = responseIndexRef.current[reactingEntity.id] || 0;
        const followUpText = followUpResponses[followUpIdx % followUpResponses.length];
        responseIndexRef.current[reactingEntity.id] = followUpIdx + 1;

        const followUpMessage: Message = {
          id: generateMessageId(),
          content: followUpText,
          senderId: reactingEntity.id,
          senderName: reactingEntity.shortName,
          senderAvatar: reactingEntity.avatar,
          senderColor: reactingEntity.colorHex,
          timestamp: Date.now(),
          type: 'ai',
        };

        responses.push(followUpMessage);
        setMessages(prev => [...prev, followUpMessage]);

        setEntities(prev => prev.map(e =>
          e.id === reactingEntity.id ? { ...e, isTyping: false } : e
        ));
      }
    }

    setIsProcessing(false);
    processingRef.current = false;
  }, [entities, messages]);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: generateMessageId(),
      content,
      senderId: 'user',
      senderName: 'You',
      senderAvatar: '',
      senderColor: '#00F0FF',
      timestamp: Date.now(),
      type: 'user',
    };

    setMessages(prev => [...prev, userMessage]);

    // Trigger AI responses
    setTimeout(() => {
      simulateAIResponses(content);
    }, 300);
  }, [simulateAIResponses]);

  // Quick topic buttons
  const handleQuickTopic = useCallback((topic: string) => {
    handleSendMessage(topic);
  }, [handleSendMessage]);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#050510' }}>
      {/* Background Effect Layer */}
      <FluidBackground />

      {/* UI Layer */}
      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 10 }}>
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            entities={entities}
            onToggleEntity={toggleEntity}
            onHoverEntity={setHoveredEntity}
            hoveredEntity={hoveredEntity}
          />

          {/* Center: Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatPanel
              messages={messages}
              entities={entities}
              isProcessing={isProcessing}
            />

            {/* Quick topics (only when no messages) */}
            {messages.length === 0 && (
              <div className="flex-shrink-0 px-6 pb-4">
                <p className="text-[10px] font-mono-data text-[#5A6782] uppercase tracking-wider mb-2">Suggested Topics</p>
                <div className="flex flex-wrap gap-2">
                  {defaultTopics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickTopic(topic)}
                      className="px-3 py-1.5 rounded-lg text-[11px] text-[#E0E8FF] transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'rgba(16, 20, 40, 0.6)',
                        border: '1px solid rgba(0, 240, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Command Input */}
            <CommandInput
              onSend={handleSendMessage}
              isProcessing={isProcessing}
              hasMessages={messages.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
