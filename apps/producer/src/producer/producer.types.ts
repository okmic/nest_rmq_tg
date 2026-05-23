export interface Message<T = any> {
  id: string;           
  pattern: string;     
  data: T;              
  timestamp: string;   
  source?: string;  
  version?: string;
  metadata?: {
    retryCount?: number;
    originalId?: string;
    correlationId?: string;
  };
}

export interface MessageAck {
  messageId: string;
  processed: boolean;
  error?: string;
  processedAt: string;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}