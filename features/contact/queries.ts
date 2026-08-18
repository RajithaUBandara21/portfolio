import { listContactMessages } from "@/services/contactService";

export function getContactMessagesForAdmin() {
  return listContactMessages();
}
