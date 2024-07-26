import { LucideImage } from "lucide-react";

const AccessibleImage: React.FC<{ size: number; className: string }> = (
    props,
  ) => {
    return (
      <span role="img" aria-hidden="true">
        <LucideImage {...props} />
      </span>
    );
  };

export default AccessibleImage;