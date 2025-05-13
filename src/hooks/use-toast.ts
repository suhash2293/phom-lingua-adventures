
import { useState, useCallback, useEffect } from "react";
import type { Toast, ToasterToast } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToastActionType = "add" | "update" | "dismiss" | "remove";

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type UseToastOptions = {
  timeout?: number;
}

// Define the state
type State = {
  toasts: ToasterToast[];
};

let memoryState: State = { toasts: [] };

function dispatch(action: {
  type: ToastActionType;
  toast?: ToasterToast;
  toastId?: string;
}) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function reducer(state: State, action: {
  type: ToastActionType;
  toast?: ToasterToast;
  toastId?: string;
}): State {
  switch (action.type) {
    case "add":
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.toast, id: action.toast?.id ?? genId() } as ToasterToast,
        ].slice(0, TOAST_LIMIT),
      };

    case "update":
      if (action.toast == null) {
        return state;
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast?.id ? { ...t, ...action.toast } : t
        ),
      };

    case "dismiss":
      if (action.toastId == null) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        ),
      };

    case "remove":
      if (action.toastId == null) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

const listeners: ((state: State) => void)[] = [];

function useToaster() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "dismiss", toastId }),
  };
}

function toast(props: Toast & UseToastOptions) {
  const { timeout, ...data } = props;

  const id = genId();

  const update = (props: Toast) =>
    dispatch({
      type: "update",
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: "dismiss", toastId: id });

  dispatch({
    type: "add",
    toast: {
      ...data,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto-dismiss toast if timeout is provided
  if (timeout) {
    setTimeout(dismiss, timeout);
  }

  return {
    id,
    dismiss,
    update,
  };
}

export { toast, useToaster as useToast };
