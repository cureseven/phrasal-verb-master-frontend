export interface AdminUser {
  id: string;
  email: string;
}

export interface AdminStats {
  totalUsers: number;
  readOnlyUsers: number;
  totalPhrasalVerbs: number;
  totalMemorized: number;
  totalReviewNeeded: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  createdAt: string;
  isReadOnly: boolean;
  memorizedCount: number;
  reviewNeededCount: number;
}
