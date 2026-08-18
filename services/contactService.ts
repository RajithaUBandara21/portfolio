import type { ContactMessage, ContactMessageStatus } from "@prisma/client";

import { db } from "@/services/db";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ipHash: string | null;
  userAgent: string | null;
}

export function createContactMessage(input: CreateContactMessageInput): Promise<ContactMessage> {
  return db.contactMessage.create({ data: input });
}

export function listContactMessages(): Promise<ContactMessage[]> {
  return db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessage> {
  return db.contactMessage.update({ where: { id }, data: { status } });
}
