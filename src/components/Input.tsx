import React from "react";

type InputVariant = "primary" | "ghost";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

const baseClasses =
  "w-full max-w-[640px] rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed border";

const variantClasses: Record<InputVariant, string> = {
  primary:
    "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:ring-blue-500 focus:border-blue-500",
  ghost:
    "border-transparent bg-transparent text-gray-900 placeholder:text-gray-500 hover:bg-gray-50 focus:border-blue-500 focus-visible:ring-blue-500",
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const Input: React.FC<InputProps> = ({
  variant = "primary",
  className,
  ...props
}) => {
  const classes = cn(baseClasses, variantClasses[variant], className);

  return <input {...props} className={classes} />;
};

export default Input;
