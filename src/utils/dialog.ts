import { defaultConfirmDialogText } from '@/consts/dialog'
import type { AlertDialogOptions } from '@/interfaces/common/dialog'

let setPendingDialog: React.Dispatch<React.SetStateAction<AlertDialogOptions | null>>

function confirm(options?: AlertDialogOptions): Promise<boolean> {
  return new Promise(() => {
    if (!setPendingDialog) {
      throw new Error('ConfirmDialog is not mounted.')
    }
    setPendingDialog(() => ({
      ...defaultConfirmDialogText,
      ...(options || {})
    }))
  })
}

function withVariant(variant: AlertDialogOptions['variant']) {
  return (options: AlertDialogOptions) => confirm({ ...options, variant })
}

export function _registerDialog(cb: typeof setPendingDialog) {
  setPendingDialog = cb
}

export const dialog = {
  confirm,
  success: withVariant('success'),
  info: withVariant('info'),
  warning: withVariant('warning'),
  danger: withVariant('danger'),
  error: withVariant('error')
}
