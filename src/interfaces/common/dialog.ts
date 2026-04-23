export type AlertVariant =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "error";

export type AlertDialogOptions = {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  variant?: AlertVariant;

  /**
   * Wether to close dialog on confirmFn (type Promise) error or not.
   * @default false
   */
  closeOnError?: boolean;

  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
};
