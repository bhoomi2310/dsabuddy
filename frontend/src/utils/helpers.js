import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const truncateText = (text, maxLength) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    if (typeof apiError === "string") return apiError;
    if (typeof apiError === "object") {
      const messages = [];
      for (const [key, value] of Object.entries(apiError)) {
        if (key !== "_errors" && value?._errors?.length) {
          messages.push(`${key}: ${value._errors.join(", ")}`);
        }
      }
      if (messages.length) return messages.join(" | ");
      if (apiError._errors?.length) return apiError._errors.join(", ");
    }
  }
  return error.message || "An unexpected error occurred.";
}
