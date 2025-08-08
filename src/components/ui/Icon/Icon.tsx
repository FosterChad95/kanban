import React from "react";
import EyeSlashIcon from "./EyeSlashIcon";
import IconBoardIcon from "./IconBoardIcon";
import Logo from "@/images/Logo";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: "eye-slash" | "icon-board" | string;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {
    case "eye-slash":
      return <EyeSlashIcon {...props} />;
    case "icon-board":
      return <IconBoardIcon {...props} />;
    case "logo-light":
      return <Logo />;
    default:
      return null;
  }
};

export default Icon;
