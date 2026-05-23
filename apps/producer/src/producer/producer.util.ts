export class IdempotencyUtil {
  private static processedIds = new Set<string>();
  private static readonly CLEANUP_INTERVAL = 3600000;
  
  static {
    setInterval(() => {
      this.processedIds.clear();
    }, this.CLEANUP_INTERVAL);
  }
  
  static isProcessed(messageId: string): boolean {
    return this.processedIds.has(messageId);
  }
  
  static markAsProcessed(messageId: string): void {
    this.processedIds.add(messageId);
  }
  
  static generateId(): string {
    return crypto.randomUUID();
  }
}