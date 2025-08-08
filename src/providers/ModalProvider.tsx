import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from "react";

type ModalContextType = {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
};

type ModalProviderProps = {
  children: ReactNode;
  ModalComponent: FC<{
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
  }>;
};

export const ModalProvider: FC<ModalProviderProps> = ({
  children,
  ModalComponent,
}) => {
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (content: ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setModalContent(null), 300); // allow animation out
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ModalComponent isOpen={isOpen} onClose={closeModal}>
        {modalContent}
      </ModalComponent>
    </ModalContext.Provider>
  );
};
