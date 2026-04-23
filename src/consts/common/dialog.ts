import type { AlertDialogOptions } from '@/interfaces/common/dialog'

export const defaultConfirmDialogText: Partial<AlertDialogOptions> = {
  title: 'Confirmation',
  description: 'Confirm your action ?',
  cancelText: 'Cancel',
  confirmText: 'Confirm'
}
