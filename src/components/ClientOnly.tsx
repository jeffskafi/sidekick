import { useEffect, useState, ReactNode, HTMLAttributes } from "react";

export default function ClientOnly({
  children,
  ...delegated
}: {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div {...delegated}>{children}</div>;
}
