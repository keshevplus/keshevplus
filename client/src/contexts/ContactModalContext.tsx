import { createContext, useContext, useState } from "react";
import ContactModal from "@/components/ContactModal";

interface ContactModalContextType {
  openModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType>({
  openModal: () => {},
});

export const useContactModal = () => useContext(ContactModalContext);

export const ContactModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <ContactModalContext.Provider value={{ openModal: () => setOpen(true) }}>
      {children}
      <ContactModal open={open} onOpenChange={setOpen} />
    </ContactModalContext.Provider>
  );
};
