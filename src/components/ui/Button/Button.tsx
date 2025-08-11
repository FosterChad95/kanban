import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary-l" | "primary-s" | "secondary" | "destructive" | "icon";
  icon?: ReactNode;
  iconOnly?: boolean;
}

const Button = ({
  className,
  variant = "primary-l",
  children,
  icon,
  iconOnly = false,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none";
  const variantStyles = {
    "primary-l":
      "rounded-[20px] heading-medium text-white bg-main-purple hover:bg-main-purple-light px-[61px] py-[15px]",
    "primary-s":
      "rounded-[20px] body-large text-white bg-main-purple hover:bg-main-purple-light px-[70px] py-2",
    secondary:
      "rounded-[20px] body-large text-main-purple bg-[rgba(99,95,199,0.10)] hover:bg-[rgba(99,95,199,0.25)] px-[70px] py-2",
    destructive:
      "rounded-[20px] body-large text-white bg-red hover:bg-red-hover px-[70px] py-2",
    icon: "rounded-full p-2 w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-100 dark:hover:bg-[#22232e]",
  };

  // If iconOnly, force icon variant and render only icon
  if (iconOnly) {
    return (
      <button
        className={cn(baseStyles, variantStyles["icon"], className)}
        {...props}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {icon && (
        <span className="inline-flex items-center justify-center mr-2">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
