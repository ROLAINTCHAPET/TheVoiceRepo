export interface Vote {
  id: string;
  candidateId: number;
  transactionId?: string;
  receiptPreviewUrl?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'rejected';
  screenshot?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface VoteNotification {
  id: string;
  voteId: string;
  candidateName: string;
  timestamp: Date;
  read: boolean;
}