import React from "react";
import EyeSlashIcon from "./EyeSlashIcon";
import IconBoardIcon from "./IconBoardIcon";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: "eye-slash" | "icon-board" | string;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {
    case "eye-slash":
      return <EyeSlashIcon {...props} />;
    case "icon-board":
      return <IconBoardIcon {...props} />;
    default:
      return null;
  }
};

export default Icon;
