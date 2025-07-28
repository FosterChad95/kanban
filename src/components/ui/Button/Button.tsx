import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import Icon from "../Icon/Icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary-l" | "primary-s" | "secondary" | "destructive";
  icon?: "eye-slash" | "icon-board";
}

const Button = ({
  className,
  variant = "primary-l",
  children,
  icon,
  ...props
}: ButtonProps) => {
  // Import Icon here to use in the render
  // (import will be added at the top)
  const baseStyles = "rounded-[20px] transition-colors duration-200 flex gap-2";

  const variantStyles = {
    "primary-l":
      "heading-medium text-white bg-main-purple hover:bg-main-purple-light px-[61px] py-[15px]",
    "primary-s":
      "body-large text-white bg-main-purple hover:bg-main-purple-light px-[70px] py-2",
    secondary:
      "body-large text-main-purple bg-[rgba(99,95,199,0.10)] hover:bg-[rgba(99,95,199,0.25)] px-[70px] py-2",
    destructive:
      "body-large text-white bg-red hover:bg-red-hover px-[70px] py-2",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {icon && (
        <span className="inline-flex items-center justify-center mr-2">
          <Icon name={icon} />
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
