export interface AIEntity {
  id: string;
  name: string;
  shortName: string;
  avatar: string;
  color: string;
  colorHex: string;
  description: string;
  personality: string;
  specialties: string[];
  accuracy: number;
  speed: number;
  creativity: number;
  isActive: boolean;
  isTyping: boolean;
  responseDelay: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  timestamp: number;
  type: 'user' | 'ai';
  isTyping?: boolean;
}

export interface ChatState {
  messages: Message[];
  activeEntities: string[];
  isProcessing: boolean;
  currentTypingEntity: string | null;
}
