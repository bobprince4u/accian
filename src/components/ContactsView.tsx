import { Contact } from "../types";
import ContactTable from "./ContactTable";

interface ContactsViewProps {
  contacts: Contact[];
  onViewContact: (contact: Contact) => void;
  onUpdateStatus: (id: string, status: Contact["status"]) => void;
  loading?: boolean;
}

export default function ContactsView({
  contacts,
  onViewContact,
  onUpdateStatus,
  loading = false,
}: ContactsViewProps) {
  return (
    <div>
      <ContactTable
        contacts={contacts}
        onViewContact={onViewContact}
        onUpdateStatus={onUpdateStatus}
        loading={loading}
      />
    </div>
  );
}
