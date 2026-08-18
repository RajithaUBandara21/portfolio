import { ContactMessageStatusSelect } from "@/components/admin/contact-message-row";
import { Badge } from "@/components/ui/badge";
import { getContactMessagesForAdmin } from "@/features/contact/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const messages = await getContactMessagesForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Messages</h1>

      {messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {message.name} · {message.email}
                  </p>
                  {message.subject ? (
                    <p className="text-muted-foreground text-sm">{message.subject}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {formatDate(message.createdAt, { month: "short", day: "numeric" })}
                  </Badge>
                  <ContactMessageStatusSelect id={message.id} status={message.status} />
                </div>
              </div>
              <p className="text-muted-foreground text-sm whitespace-pre-line">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
