import { getFirestoreDb } from '../config/firebase-admin.js';

export interface CreateReportDTO {
  reporterId: string;
  targetType: 'user' | 'ride' | 'booking' | 'review';
  targetId: string;
  reason: string;
  details?: string;
}

export class ReportService {
  private static collection = 'reports';

  static async createReport(dto: CreateReportDTO): Promise<any> {
    const db = getFirestoreDb();
    const docRef = db.collection(this.collection).doc();
    const data = {
      id: docRef.id,
      ...dto,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await docRef.set(data);
    return data;
  }
}
