export type Channel = "In-app" | "Email" | "SMS";

export interface Broadcast {
  id: string;
  title: string;
  audience: string;
  delivered: number;
  time: string;
  createdAt?: string;
  channel: string;
  channels?: Channel[];
  status: string;
  message: string;
  sender?: string;
  failedCount?: number;
}

export interface AudienceOption {
  label: string;
  count: number;
  category?: string;
}

export interface ChannelHealth {
  channel: Channel | string;
  status: "Operational" | "Degraded" | "Outage";
  successRate: number;
  latency: string;
  description: string;
}

export interface CommunicationsOverviewDto {
  totalBroadcasts: number;
  totalRecipientsDelivered: number;
  activeVolunteers: number;
  deliverySuccessRate: number;
  channelHealth: ChannelHealth[];
}

export interface CreateBroadcastRequest {
  title: string;
  audience: string;
  message: string;
  channels: Channel[];
  sender?: string;
}

export interface BroadcastQueryDto {
  search?: string;
  channel?: string;
  status?: string;
  audience?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CommunicationDraftDto {
  id: string;
  title: string;
  message: string;
  audience: string;
  channels: Channel[];
  updatedAt: string;
}

export interface SaveDraftRequest {
  title: string;
  message: string;
  audience: string;
  channels: Channel[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
