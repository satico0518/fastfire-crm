import { create } from "zustand";
import { ModalComponentProps } from "../../components/modal/ModalComponent";
import { SnackbarComponentProps } from "../../components/snackbar/SnackbarComponent";
import { ConfirmationComponentProps } from "../../components/confirmation/ConfirmationComponent";

interface UiState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  modal: ModalComponentProps;
  setModal: (modal: ModalComponentProps) => void;
  snackbar: SnackbarComponentProps;
  setSnackbar: (snackbar: SnackbarComponentProps) => void;
  confirmation: ConfirmationComponentProps;
  setConfirmation: (snackbar: ConfirmationComponentProps) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),
  modal: {open: false, title: '', content: null, },
  setModal: (modal: ModalComponentProps) => set(() => ({ modal })),
  snackbar: {open: false, message: '', duration: 4000, severity: 'info'},
  setSnackbar: (snackbar: SnackbarComponentProps) => set(() => ({snackbar})),
  confirmation: {open: false, title: '', text: '', actions: null},
  setConfirmation: (confirmation: ConfirmationComponentProps) => set(() => ({confirmation})),
}));
