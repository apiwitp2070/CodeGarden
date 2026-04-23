'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '#/components/ui/alert-dialog'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { _registerDialog } from '#/utils/dialog'
import type { AlertDialogOptions, AlertVariant } from '#/interfaces/common/dialog'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from 'lucide-react'
import { defaultConfirmDialogText } from '#/consts/common/dialog'
import type { ButtonVariant } from '#/components/ui/button'

interface VariantStyleProps {
  icon?: LucideIcon
  confirmBtnVariant?: ButtonVariant
}

const variantStyles: Record<AlertVariant, VariantStyleProps> = {
  default: {},
  success: {
    icon: CheckCircle2Icon
  },
  info: {
    icon: InfoIcon
  },
  warning: {
    icon: AlertTriangleIcon
  },
  danger: {
    icon: AlertTriangleIcon,
    confirmBtnVariant: 'destructive' as const
  },
  error: {
    icon: XCircleIcon
  }
}

export function ConfirmDialog() {
  const [options, setOptions] = useState<AlertDialogOptions | null>(null) // null for closed state
  const [loading, setLoading] = useState<boolean>(false)

  const rootRef = useRef<HTMLDivElement>(null)

  const open = !!options

  const style = variantStyles[options?.variant || 'default']

  // Default Text
  const title = options?.title || defaultConfirmDialogText.title
  const description = options?.description || defaultConfirmDialogText.description
  const confirmText = options?.confirmText || defaultConfirmDialogText.confirmText
  const cancelText = options?.cancelText || defaultConfirmDialogText.cancelText

  useEffect(() => {
    // NOTE: For presistent modal container. If not assign ref, when loading state change
    // and component re-render, dialog will become null from rendering condition below
    if (!rootRef.current) {
      const el = document.createElement('div')
      document.body.appendChild(el)
      rootRef.current = el
    }

    _registerDialog(setOptions)
  }, [])

  const handleConfirm = async () => {
    if (!options?.onConfirm) {
      setOptions(null)
      return
    }

    const result = options.onConfirm()
    try {
      if (result instanceof Promise) {
        setLoading(true)
        await result
      } else {
        options.onConfirm()
      }

      setOptions(null)
    } catch {
      if (options.closeOnError) {
        setOptions(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    options?.onCancel?.()
    setOptions(null)
  }

  if (!rootRef.current) return null

  return createPortal(
    <AlertDialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-row gap-2 items-center">
            {style.icon && <style.icon />}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={!open} loading={loading} onClick={() => handleClose()}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!open}
            loading={loading}
            variant={style.confirmBtnVariant}
            onClick={() => handleConfirm()}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
    rootRef.current
  )
}
